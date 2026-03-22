import { Component } from '@angular/core';
import { ChatbotWidgetComponent } from './components/chatbot-widget/chatbot-widget.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ChatbotWidgetComponent],
  template: `
    <div class="min-h-screen bg-hx-navy flex items-center justify-center relative overflow-hidden">

      <!-- Background glow blobs -->
      <div class="absolute top-0 left-1/4 w-96 h-96 rounded-full pointer-events-none"
        style="background: radial-gradient(circle, rgba(0,119,182,0.08) 0%, transparent 70%);"></div>
      <div class="absolute bottom-0 right-1/4 w-96 h-96 rounded-full pointer-events-none"
        style="background: radial-gradient(circle, rgba(0,163,224,0.06) 0%, transparent 70%);"></div>

      <!-- Content -->
      <div class="relative z-10 text-center px-8" style="max-width: 640px;">

        <!-- Logo row -->
        <div class="flex items-center justify-center gap-3 mb-10">
          <svg width="38" height="38" viewBox="0 0 40 40" fill="none">
            <polygon points="20,2 37,11.5 37,28.5 20,38 3,28.5 3,11.5"
              fill="#0c2a4a" stroke="#00a3e0" stroke-width="1.5"/>
            <text x="20" y="24" text-anchor="middle"
              fill="#00a3e0" font-size="13" font-weight="700"
              font-family="Inter, sans-serif">H</text>
          </svg>
          <span class="text-2xl font-bold text-white tracking-tight">
            HEXX<span class="text-hx-blue">CELL</span>
          </span>
        </div>

        <h1 class="text-4xl font-bold text-white leading-tight mb-4">
          Hybrid-AI Digital Twins<br>
          <span class="text-hx-blue">for Industrial Thermal Systems</span>
        </h1>

        <p class="text-hx-text3 text-base leading-relaxed mb-8" style="max-width: 520px; margin-left: auto; margin-right: auto;">
          We combine Artificial Intelligence with physics-based models and deep
          domain knowledge for monitoring, design and maintenance of heat exchanger networks.
        </p>

        <!-- CTA button — matches hexxcell.com style -->
        <a href="https://hexxcell.com/technology" target="_blank"
          class="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold text-white transition-all duration-200 hover:opacity-90"
          style="background: linear-gradient(135deg, #00a3e0, #0077b6); box-shadow: 0 4px 16px rgba(0,163,224,0.3);">
          Explore Technology
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </a>

        <p class="mt-12 text-hx-text4 text-xs font-mono" style="animation: pulse 2s ease-in-out infinite;">
          👉 Click the blue button in the bottom-right to open the AI chat
        </p>
      </div>
    </div>

    <app-chatbot-widget></app-chatbot-widget>
  `
})
export class AppComponent {}
