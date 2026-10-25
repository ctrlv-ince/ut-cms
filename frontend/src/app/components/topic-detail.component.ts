import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TopicDetailContent } from '../data/topic-curriculum.data';

@Component({
  selector: 'app-topic-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './topic-detail.component.html'
})
export class TopicDetailComponent {
  @Input({ required: true }) topic!: TopicDetailContent;
  @Input() authorName: string = 'David, Lance B.';

  @Output() close = new EventEmitter<void>();
  @Output() selectModule = new EventEmitter<number>();
  @Output() switchToStudio = new EventEmitter<string>();
  @Output() scrollToSection = new EventEmitter<string>();

  activeTab = signal<'code' | 'flow' | 'hardware' | 'directus'>('code');
  copiedCode = signal<boolean>(false);
  copiedFlow = signal<boolean>(false);
  completedSteps = signal<Set<number>>(new Set());

  copyScript() {
    if (!this.topic.functionScript) return;
    navigator.clipboard.writeText(this.topic.functionScript).then(() => {
      this.copiedCode.set(true);
      setTimeout(() => this.copiedCode.set(false), 2000);
    });
  }

  copyFlow() {
    if (!this.topic.flowJson) return;
    navigator.clipboard.writeText(this.topic.flowJson).then(() => {
      this.copiedFlow.set(true);
      setTimeout(() => this.copiedFlow.set(false), 2000);
    });
  }

  toggleStep(index: number) {
    this.completedSteps.update(set => {
      const updated = new Set(set);
      if (updated.has(index)) {
        updated.delete(index);
      } else {
        updated.add(index);
      }
      return updated;
    });
  }

  jumpToSection(sectionId: string) {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
