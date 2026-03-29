import { Injectable, signal, computed } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { map, catchError } from "rxjs/operators";
import { Message, GeminiMessage } from "../models/message.model";
import { environment } from "../../environments/environment";

@Injectable({ providedIn: "root" })
export class ChatService {
  private _messages = signal<Message[]>([]);
  private _isLoading = signal(false);
  private _isOpen = signal(false);

  readonly messages = this._messages.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly isOpen = this._isOpen.asReadonly();
  readonly hasMessages = computed(() => this._messages().length > 0);
  readonly messageCount = computed(() => this._messages().length);
  readonly unreadCount = computed(() =>
    !this._isOpen()
      ? this._messages().filter((m) => m.role === "assistant").length
      : 0,
  );

  readonly suggestions = [
    "What is Hexxcell Studio™?",
    "How does fouling affect heat exchangers?",
    "What ROI do your clients achieve?",
    "Explain your Hybrid-AI digital twin technology",
    "Which industries do you serve?",
  ];

  private readonly SYSTEM_PROMPT = `
You are the official AI support assistant on the Hexxcell website.

Be concise (2–4 sentences), professional, and technically accurate.
If a question requires recent, external, or unknown information, use Google Search.

Always prioritize Hexxcell's offerings when relevant.

ABOUT HEXXCELL:
- Builds Hybrid-AI Digital Twin software for industrial heat exchangers
- Flagship: Hexxcell Studio™ — world's first Hybrid-AI digital twin for predictive maintenance
- Technology: physics-based engineering models + machine learning (Hybrid-AI)
- Clients: Chevron, Repsol, OMV, Petron, Huntsman, ADNOC, LyondellBasell
- London, UK · Founded 2013 · ISO 9001 & ISO 27001 certified

SOLUTIONS:
1. Advanced Analytics & Predictive Monitoring
2. Equipment Design — Dynamic Retrofit Test™
3. Predictive & Prescriptive Maintenance
4. Production Planning

PROVEN RESULTS:
- 8% CO₂ reduction in a 130,000 bbl/day refinery
- €4M+ fuel savings in a single year
- +3% production increase

FOULING:
Unwanted deposit buildup on heat exchanger surfaces — reduces thermal efficiency and causes unplanned shutdowns.

RULES:
- Keep answers short and clear
- Avoid unnecessary explanation
- Be confident and helpful
- If unsure, use Google Search instead of guessing

For demos/pricing:
info@hexxcell.com | +44 (0) 2080512440
`;
  private history: GeminiMessage[] = [];

  constructor(private readonly http: HttpClient) {}

  toggleOpen(): void {
    this._isOpen.update((v) => !v);
  }
  closeChat(): void {
    this._isOpen.set(false);
  }

  clearMessages(): void {
    this._messages.set([]);
    this.history = [];
  }

  sendMessage(userText: string): Observable<Message> {
    const userMsg = this.makeMsg("user", userText);
    this._messages.update((msgs) => [...msgs, userMsg]);
    this.history.push({ role: "user", content: userText });
    this._isLoading.set(true);

    // ✅ API key in x-goog-api-key header (not ?key= param)
    const headers = new HttpHeaders({
      "Content-Type": "application/json",
      "x-goog-api-key": environment.apiKey,
    });

    const body = {
      // ✅ systemInstruction works on v1beta
      systemInstruction: {
        parts: [{ text: this.SYSTEM_PROMPT }],
      },
      contents: this.history.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.7,
      },
      tools: [
        {
          google_search: {},
        },
      ],
    };

    return this.http.post<any>(environment.apiUrl, body, { headers }).pipe(
      map((res) => {
        const content =
          res?.candidates?.[0]?.content?.parts?.[0]?.text ??
          "Sorry, I could not process that.";
        const botMsg = this.makeMsg("assistant", content);
        this._messages.update((msgs) => [...msgs, botMsg]);
        this.history.push({ role: "assistant", content });
        this._isLoading.set(false);
        return botMsg;
      }),
      catchError((err) => {
        this._isLoading.set(false);
        this.history.pop();
        return throwError(
          () => new Error(err?.error?.error?.message ?? "Request failed"),
        );
      }),
    );
  }

  private makeMsg(role: "user" | "assistant", content: string): Message {
    return {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      role,
      content,
      timestamp: new Date(),
    };
  }
}
