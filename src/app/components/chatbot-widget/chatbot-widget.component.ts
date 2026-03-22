import {
  Component, ViewChild, ElementRef,
  AfterViewChecked, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat.service';
import { Message } from '../../models/message.model';

@Component({
  selector: 'app-chatbot-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  // ─────────────────────────────────────────────────────────────
  // All SVGs have explicit width/height attributes — this is the
  // fix for "huge icons": never rely on CSS alone for SVG sizing,
  // always set width + height directly on the <svg> element AND
  // control with Tailwind's w-* / h-* for consistency.
  // ─────────────────────────────────────────────────────────────
  template: `
<div class="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3">

  <!-- ════════════════════════════════════════════
       CHAT PANEL
       ════════════════════════════════════════════ -->
  <div
    class="flex flex-col overflow-hidden rounded-2xl border border-hx-border bg-hx-navy2 shadow-2xl transition-all duration-300 origin-bottom-right"
    [class.opacity-0]="!svc.isOpen()"
    [class.scale-95]="!svc.isOpen()"
    [class.translate-y-4]="!svc.isOpen()"
    [class.pointer-events-none]="!svc.isOpen()"
    [class.opacity-100]="svc.isOpen()"
    [class.scale-100]="svc.isOpen()"
    [class.translate-y-0]="svc.isOpen()"
    style="width: 360px; height: 520px;"
    role="dialog"
    aria-label="Hexxcell AI Assistant"
  >

    <!-- Header -->
    <div class="flex items-center justify-between px-4 py-3 bg-hx-navy border-b border-hx-border flex-shrink-0">
      <div class="flex items-center gap-2.5">

        <!-- Hex logo: explicit 32x32, no class sizing needed -->
        <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="20,2 37,11.5 37,28.5 20,38 3,28.5 3,11.5"
            fill="#0c2a4a" stroke="#00a3e0" stroke-width="1.5"/>
          <text x="20" y="24" text-anchor="middle"
            fill="#00a3e0" font-size="13" font-weight="700"
            font-family="Inter, sans-serif">H</text>
        </svg>

        <div class="flex flex-col leading-tight">
          <span class="text-white text-sm font-semibold tracking-wide">Hexxcell Assistant</span>
          <span class="flex items-center gap-1.5 text-hx-text3 text-xs">
            <span class="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-blink"
              style="box-shadow: 0 0 5px #4ade80;"></span>
            AI Online
          </span>
        </div>
      </div>

      <div class="flex items-center gap-1">
        <!-- Clear button: 28x28 touch target, 14x14 icon inside -->
        <button (click)="onClear()"
          class="w-7 h-7 flex items-center justify-center rounded-lg text-hx-text3 hover:text-white hover:bg-white/5 transition-colors"
          title="Clear chat">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14H6L5 6"/>
            <path d="M10 11v6M14 11v6"/>
            <path d="M9 6V4h6v2"/>
          </svg>
        </button>
        <!-- Close button -->
        <button (click)="svc.closeChat()"
          class="w-7 h-7 flex items-center justify-center rounded-lg text-hx-text3 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          title="Close">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Messages -->
    <div class="flex-1 overflow-y-auto flex flex-col gap-3 px-3 py-3"
      #scrollContainer>

      <!-- Welcome screen -->
      <div *ngIf="!svc.hasMessages()"
        class="flex flex-col items-center text-center gap-3 py-2 animate-fade-up">

        <!-- Welcome icon: explicit 48x48 -->
        <div class="w-12 h-12 rounded-xl bg-hx-panel border border-hx-border flex items-center justify-center flex-shrink-0">
          <svg width="26" height="26" viewBox="0 0 40 40" fill="none">
            <polygon points="20,2 37,11.5 37,28.5 20,38 3,28.5 3,11.5"
              fill="rgba(0,163,224,0.1)" stroke="#00a3e0" stroke-width="1.5"/>
            <text x="20" y="24" text-anchor="middle"
              fill="#00a3e0" font-size="12" font-weight="700"
              font-family="Inter, sans-serif">H</text>
          </svg>
        </div>

        <div>
          <p class="text-white text-sm font-semibold mb-1">Hi, I'm the Hexxcell Assistant</p>
          <p class="text-hx-text3 text-xs leading-relaxed" style="max-width: 270px;">
            Ask me anything about Hexxcell Studio™, fouling prediction,
            predictive maintenance, or our Hybrid-AI technology.
          </p>
        </div>

        <!-- Suggestions -->
        <div class="flex flex-col gap-1.5 w-full">
          <button *ngFor="let s of svc.suggestions"
            (click)="sendSuggestion(s)"
            class="w-full text-left px-3 py-2 rounded-lg border border-hx-border bg-hx-panel text-hx-text2 text-xs leading-relaxed hover:border-hx-blue/40 hover:bg-hx-blue/5 hover:text-white transition-all duration-150 cursor-pointer">
            {{ s }}
          </button>
        </div>
      </div>

      <!-- Message list -->
      <div *ngFor="let msg of svc.messages(); trackBy: trackById"
        class="flex gap-2 items-end animate-msg-in"
        [class.flex-row-reverse]="msg.role === 'user'">

        <!-- Bot avatar: always exactly 28x28 -->
        <div *ngIf="msg.role === 'assistant'"
          class="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded"
          style="background: #0c2a4a; border: 1px solid #00a3e0;">
          <svg width="20" height="20" viewBox="0 0 40 40" fill="none">
            <polygon points="20,2 37,11.5 37,28.5 20,38 3,28.5 3,11.5"
              fill="#0c2a4a" stroke="#00a3e0" stroke-width="1.5"/>
            <text x="20" y="24" text-anchor="middle"
              fill="#00a3e0" font-size="11" font-weight="700"
              font-family="Inter, sans-serif">HX</text>
          </svg>
        </div>

        <!-- User avatar: always exactly 28x28 -->
        <div *ngIf="msg.role === 'user'"
          class="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded bg-hx-panel border border-hx-border2">
          <span class="text-hx-blue text-[9px] font-bold font-mono leading-none">YOU</span>
        </div>

        <!-- Bubble -->
        <div class="flex flex-col" [class.items-end]="msg.role === 'user'" style="max-width: 80%;">
          <div class="px-3 py-2.5 rounded-xl text-xs leading-relaxed"
            [class.bg-hx-panel]="msg.role === 'assistant'"
            [class.border]="true"
            [class.border-hx-border]="msg.role === 'assistant'"
            [class.text-hx-text2]="msg.role === 'assistant'"
            [class.rounded-bl-sm]="msg.role === 'assistant'"
            [class.text-white]="msg.role === 'user'"
            [class.rounded-br-sm]="msg.role === 'user'"
            [class.bot-bubble]="msg.role === 'assistant'"
            [ngStyle]="msg.role === 'user' ? {background: 'linear-gradient(135deg, #00a3e0, #0077b6)', border: '1px solid #0077b6'} : {}">
            <span [innerHTML]="format(msg.content)"></span>
          </div>
          <span class="text-hx-text4 text-[10px] mt-1 px-0.5 font-mono">
            {{ msg.timestamp | date:'HH:mm' }}
          </span>
        </div>
      </div>

      <!-- Typing indicator -->
      <div *ngIf="svc.isLoading()" class="flex gap-2 items-end animate-msg-in">
        <div class="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded"
          style="background: #0c2a4a; border: 1px solid #00a3e0;">
          <svg width="20" height="20" viewBox="0 0 40 40" fill="none">
            <polygon points="20,2 37,11.5 37,28.5 20,38 3,28.5 3,11.5"
              fill="#0c2a4a" stroke="#00a3e0" stroke-width="1.5"/>
            <text x="20" y="24" text-anchor="middle"
              fill="#00a3e0" font-size="11" font-weight="700"
              font-family="Inter,sans-serif">HX</text>
          </svg>
        </div>
        <div class="flex gap-1 px-3.5 py-3 rounded-xl rounded-bl-sm bg-hx-panel border border-hx-border items-center">
          <span class="w-1.5 h-1.5 rounded-full bg-hx-blue inline-block animate-bounce-dot"></span>
          <span class="w-1.5 h-1.5 rounded-full bg-hx-blue inline-block animate-bounce-dot2"></span>
          <span class="w-1.5 h-1.5 rounded-full bg-hx-blue inline-block animate-bounce-dot3"></span>
        </div>
      </div>

      <!-- Error -->
      <div *ngIf="errorMsg()"
        class="flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border text-xs animate-msg-in"
        style="background: rgba(239,68,68,0.08); border-color: rgba(239,68,68,0.2); color: #f87171;">
        <span>⚠️ {{ errorMsg() }}</span>
        <button (click)="errorMsg.set('')" class="font-bold text-sm leading-none hover:opacity-70">✕</button>
      </div>

      <div #scrollEnd></div>
    </div>

    <!-- Input bar -->
    <div class="px-3 py-2.5 border-t border-hx-border bg-hx-navy flex-shrink-0">
      <div class="flex items-end gap-2 rounded-xl border bg-hx-panel px-3 py-2 transition-colors duration-150"
        [class.border-hx-blue]="isFocused"
        [class.border-hx-border]="!isFocused">

        <textarea
          [(ngModel)]="inputText"
          rows="1"
          placeholder="Ask about Hexxcell..."
          (keydown)="onKeyDown($event)"
          (input)="autoResize($event)"
          (focus)="isFocused = true"
          (blur)="isFocused = false"
          class="flex-1 bg-transparent border-none outline-none text-white placeholder-hx-text4 text-sm resize-none leading-relaxed"
          style="min-height: 20px; max-height: 76px;">
        </textarea>

        <!-- Send button: explicit 32x32 container, 16x16 icon -->
        <button (click)="send()"
          [disabled]="svc.isLoading() || !inputText.trim()"
          class="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150"
          [ngStyle]="(svc.isLoading() || !inputText.trim())
            ? {background: '#1e3050', color: '#556070', cursor: 'not-allowed', opacity: '0.5'}
            : {background: 'linear-gradient(135deg, #00a3e0, #0077b6)', color: '#fff', cursor: 'pointer'}"
          title="Send">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </button>
      </div>

      <p class="text-center text-hx-text4 text-[10px] mt-1.5 font-mono">
        Powered by Hexxcell AI ·
        <a href="https://hexxcell.com" target="_blank" rel="noopener"
          class="hover:text-hx-blue transition-colors">hexxcell.com</a>
      </p>
    </div>

  </div><!-- /chat panel -->

  <!-- ════════════════════════════════════════════
       FAB LAUNCHER BUTTON — 56x56 always
       ════════════════════════════════════════════ -->
  <div class="relative">
    <!-- Ping ring when first shown -->
    <span *ngIf="!svc.isOpen() && !svc.hasMessages()"
      class="absolute inset-0 rounded-full animate-ping"
      style="background: rgba(0,163,224,0.25);"></span>

    <button (click)="svc.toggleOpen()"
      class="relative w-14 h-14 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110 active:scale-95 focus:outline-none flex-shrink-0"
      style="background: linear-gradient(135deg, #00a3e0, #0077b6); box-shadow: 0 4px 18px rgba(0,163,224,0.45);"
      [attr.aria-label]="svc.isOpen() ? 'Close chat' : 'Open chat'">

      <!-- Chat icon 24x24 — explicit, never scaled by CSS -->
      <svg *ngIf="!svc.isOpen()"
        width="24" height="24" viewBox="0 0 24 24" fill="white">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
      </svg>

      <!-- Close icon 22x22 — explicit -->
      <svg *ngIf="svc.isOpen()"
        width="22" height="22" viewBox="0 0 24 24" fill="white">
        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
      </svg>
    </button>

    <!-- Unread badge -->
    <span *ngIf="!svc.isOpen() && svc.unreadCount() > 0"
      class="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white font-bold animate-pop border-2 border-hx-navy"
      style="background: #f97316;">
      {{ svc.unreadCount() }}
    </span>
  </div>

</div>
  `,
  styles: [`
    :host { display: contents; }
  `]
})
export class ChatbotWidgetComponent implements AfterViewChecked {
  @ViewChild('scrollContainer') private sc!: ElementRef<HTMLDivElement>;

  readonly svc = new ChatService(null as any); // overridden by DI — see constructor
  inputText = '';
  isFocused = false;
  errorMsg  = signal('');

  constructor(chatService: ChatService) {
    (this as any).svc = chatService;
  }

  ngAfterViewChecked(): void {
    try {
      const el = this.sc.nativeElement;
      el.scrollTop = el.scrollHeight;
    } catch { /* not yet mounted */ }
  }

  trackById(_i: number, msg: Message): string { return msg.id; }

  format(text: string): string {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }

  sendSuggestion(s: string): void { this.inputText = s; this.send(); }

  onKeyDown(e: KeyboardEvent): void {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.send(); }
  }

  autoResize(e: Event): void {
    const el = e.target as HTMLTextAreaElement;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 76)}px`;
  }

  onClear(): void { this.svc.clearMessages(); this.errorMsg.set(''); }

  send(): void {
    const text = this.inputText.trim();
    if (!text || this.svc.isLoading()) return;
    this.inputText = '';
    this.errorMsg.set('');
    this.svc.sendMessage(text).subscribe({
      next: () => {},
      error: (err: Error) => this.errorMsg.set(err.message)
    });
  }
}
