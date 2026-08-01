import { Component, inject, signal, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ChatService } from '../../core/services/chat.service';
import { AuthService } from '../../core/services/auth.service';
import { ChatMessage } from '../../core/models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex h-[calc(100vh-64px)] bg-[#F2F0EF]">
      <!-- Sidebar: Conversation List (simplified) -->
      <div class="hidden md:flex md:w-72 flex-col bg-white border-r border-[#E6E6E6]">
        <div class="p-4 border-b border-[#E6E6E6]">
          <h2 class="font-bold text-[#252525]">💬 Messages</h2>
        </div>
        <div class="flex-1 overflow-y-auto p-2">
          <div *ngFor="let c of conversations()" (click)="selectConversation(c.userId)"
               [class]="selectedUserId() === c.userId ? 'flex items-center gap-3 p-3 rounded-xl bg-[#F2F0EF] cursor-pointer' : 'flex items-center gap-3 p-3 rounded-xl hover:bg-[#F2F0EF] cursor-pointer'">
            <div class="w-10 h-10 bg-[#7B9699] rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
              {{ c.name[0] }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-medium text-sm text-[#252525] truncate">{{ c.name }}</p>
              <p class="text-xs text-[#7D7D7D] truncate">{{ c.lastMessage }}</p>
            </div>
            <span *ngIf="c.unread > 0" class="w-5 h-5 bg-[#7B9699] rounded-full text-white text-xs flex items-center justify-center">{{ c.unread }}</span>
          </div>
        </div>
      </div>

      <!-- Chat Window -->
      <div class="flex-1 flex flex-col">
        <ng-container *ngIf="selectedUserId(); else noChat">
          <!-- Chat Header -->
          <div class="bg-white border-b border-[#E6E6E6] px-4 py-3 flex items-center gap-3">
            <div class="w-9 h-9 bg-[#7B9699] rounded-full flex items-center justify-center text-white font-bold">
              {{ chatPartnerName()[0] || '?' }}
            </div>
            <div>
              <p class="font-semibold text-[#252525] text-sm">{{ chatPartnerName() }}</p>
              <p class="text-xs text-[#7D7D7D]">{{ (chatService.connected$ | async) ? '🟢 Connected' : '⚪ Connecting...' }}</p>
            </div>
          </div>

          <!-- Messages -->
          <div #messagesContainer class="flex-1 overflow-y-auto p-4 space-y-3">
            <div *ngFor="let msg of messages(); trackBy: trackByMsg"
                 [class]="msg.senderId === currentUserId() ? 'flex justify-end' : 'flex justify-start'"
                 class="fade-in">
              <div [class]="msg.senderId === currentUserId()
                ? 'max-w-[70%] bg-[#7B9699] text-white rounded-2xl rounded-tr-sm px-4 py-2.5'
                : 'max-w-[70%] bg-white text-[#252525] rounded-2xl rounded-tl-sm px-4 py-2.5 shadow-sm'">
                <p class="text-sm leading-relaxed">{{ msg.content }}</p>
                <p class="text-[10px] mt-1 opacity-70 text-right">
                  {{ msg.createdAt | date:'shortTime' }}
                </p>
              </div>
            </div>

            <!-- Typing indicator -->
            <div *ngIf="partnerTyping()" class="flex justify-start">
              <div class="bg-white rounded-2xl px-4 py-3 shadow-sm">
                <div class="flex gap-1">
                  <div class="w-2 h-2 bg-[#CFCFCF] rounded-full animate-bounce" style="animation-delay: 0s"></div>
                  <div class="w-2 h-2 bg-[#CFCFCF] rounded-full animate-bounce" style="animation-delay: 0.15s"></div>
                  <div class="w-2 h-2 bg-[#CFCFCF] rounded-full animate-bounce" style="animation-delay: 0.3s"></div>
                </div>
              </div>
            </div>

            <div #bottomAnchor></div>
          </div>

          <!-- Input -->
          <div class="bg-white border-t border-[#E6E6E6] p-3">
            <div class="flex items-center gap-2">
              <label class="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#F2F0EF] cursor-pointer text-[#7D7D7D]">
                📎
                <input type="file" accept="image/*" class="hidden" (change)="onImageAttach($event)">
              </label>
              <input [(ngModel)]="messageText" (keydown.enter)="sendMessage()" (input)="onTyping()"
                     type="text" placeholder="Type a message..."
                     class="flex-1 bg-[#F2F0EF] rounded-full px-4 py-2.5 text-sm outline-none text-[#252525] placeholder:text-[#BBBDBC]">
              <button (click)="sendMessage()" [disabled]="!messageText.trim()"
                      class="w-9 h-9 flex items-center justify-center rounded-full bg-[#7B9699] text-white disabled:opacity-40 hover:bg-[#6C8480] transition-colors">
                ➤
              </button>
            </div>
          </div>
        </ng-container>

        <ng-template #noChat>
          <div class="flex-1 flex items-center justify-center">
            <div class="text-center">
              <div class="text-6xl mb-4">💬</div>
              <h3 class="text-[#252525] font-semibold mb-2">Select a conversation</h3>
              <p class="text-[#7D7D7D] text-sm">Choose a vendor or customer to start chatting</p>
            </div>
          </div>
        </ng-template>
      </div>
    </div>
  `
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('bottomAnchor') bottomAnchor!: ElementRef;
  @ViewChild('messagesContainer') msgContainer!: ElementRef;

  chatService = inject(ChatService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);

  messages = signal<ChatMessage[]>([]);
  selectedUserId = signal<number | null>(null);
  chatPartnerName = signal('');
  partnerTyping = signal(false);
  currentUserId = signal(this.authService.currentUser()?.id ?? 0);
  conversations = signal<Array<{ userId: number; name: string; lastMessage: string; unread: number }>>([]);

  messageText = '';
  private roomId = '';
  private msgSub?: Subscription;
  private shouldScroll = false;

  ngOnInit(): void {
    this.chatService.connect();
    this.msgSub = this.chatService.messages$.subscribe(msgs => {
      this.messages.set(msgs);
      this.shouldScroll = true;
    });

    // Check if routed with userId param
    this.route.queryParams.subscribe(params => {
      if (params['userId']) this.selectConversation(+params['userId']);
    });
  }

  selectConversation(userId: number): void {
    this.selectedUserId.set(userId);
    this.roomId = this.getRoomId(this.currentUserId(), userId);
    this.chatService.clearMessages();
    this.chatService.joinRoom(this.roomId);
    this.chatService.getChatHistory(userId).subscribe({
      next: msgs => { this.messages.set(msgs); this.shouldScroll = true; },
      error: () => {}
    });
  }

  sendMessage(): void {
    if (!this.messageText.trim() || !this.selectedUserId()) return;
    const msg: ChatMessage = {
      senderId: this.currentUserId(),
      receiverId: this.selectedUserId()!,
      content: this.messageText.trim(),
      type: 'TEXT',
      createdAt: new Date().toISOString()
    };
    this.chatService.sendMessage(this.roomId, msg);
    this.messages.update(msgs => [...msgs, msg]);
    this.messageText = '';
    this.shouldScroll = true;
  }

  onTyping(): void {
    // Could broadcast typing indicator via websocket
  }

  onImageAttach(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    // TODO: upload image and send as message
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  ngOnDestroy(): void {
    this.msgSub?.unsubscribe();
    this.chatService.disconnect();
  }

  private scrollToBottom(): void {
    try { this.bottomAnchor.nativeElement.scrollIntoView({ behavior: 'smooth' }); } catch {}
  }

  private getRoomId(a: number, b: number): string {
    return [a, b].sort().join('-');
  }

  trackByMsg(_: number, m: ChatMessage): string {
    return `${m.senderId}-${m.createdAt}`;
  }
}
