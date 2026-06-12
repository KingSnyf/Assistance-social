import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="pagination" *ngIf="totalPages > 1">
      <div class="pag-info">
        {{ rangeStart }}–{{ rangeEnd }} sur {{ total }}
      </div>
      <div class="pag-controls">
        <button class="pag-btn" [disabled]="currentPage === 1" (click)="go(1)" title="Première page">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="11 17 6 12 11 7"/><polyline points="18 17 13 12 18 7"/>
          </svg>
        </button>
        <button class="pag-btn" [disabled]="currentPage === 1" (click)="go(currentPage - 1)" title="Page précédente">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>

        <ng-container *ngFor="let p of pages">
          <span class="pag-dots" *ngIf="p === -1">…</span>
          <button *ngIf="p !== -1"
            class="pag-btn pag-num"
            [class.active]="p === currentPage"
            (click)="go(p)">
            {{ p }}
          </button>
        </ng-container>

        <button class="pag-btn" [disabled]="currentPage === totalPages" (click)="go(currentPage + 1)" title="Page suivante">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
        <button class="pag-btn" [disabled]="currentPage === totalPages" (click)="go(totalPages)" title="Dernière page">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="13 17 18 12 13 7"/><polyline points="6 17 11 12 6 7"/>
          </svg>
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .pagination {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 20px;
      border-top: 1px solid #f0f4f8;
      background: #fafbfc;
      border-radius: 0 0 12px 12px;
      gap: 12px;
      flex-wrap: wrap;
    }

    .pag-info {
      font-size: 12px;
      color: #94a3b8;
      font-weight: 500;
    }

    .pag-controls {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .pag-btn {
      min-width: 32px;
      height: 32px;
      padding: 0 8px;
      border: 1.5px solid #e2e8f0;
      border-radius: 7px;
      background: white;
      color: #475569;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s;
      font-family: inherit;
    }

    .pag-btn:hover:not(:disabled):not(.active) {
      border-color: #166534;
      color: #166534;
      background: #f0fdf4;
    }

    .pag-btn:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }

    .pag-btn.active {
      background: #166534;
      border-color: #166534;
      color: white;
      cursor: default;
    }

    .pag-dots {
      font-size: 13px;
      color: #cbd5e1;
      padding: 0 4px;
      line-height: 32px;
    }
  `]
})
export class PaginationComponent implements OnChanges {
  @Input() total      = 0;
  @Input() pageSize   = 15;
  @Input() currentPage = 1;
  @Output() pageChange = new EventEmitter<number>();

  totalPages = 0;
  pages: number[] = [];
  rangeStart = 0;
  rangeEnd   = 0;

  ngOnChanges(): void {
    this.totalPages = Math.ceil(this.total / this.pageSize) || 1;
    this.rangeStart = (this.currentPage - 1) * this.pageSize + 1;
    this.rangeEnd   = Math.min(this.currentPage * this.pageSize, this.total);
    this.buildPages();
  }

  buildPages(): void {
    const total = this.totalPages;
    const cur   = this.currentPage;
    const pages: number[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (cur > 3)       pages.push(-1);
      const start = Math.max(2, cur - 1);
      const end   = Math.min(total - 1, cur + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (cur < total - 2) pages.push(-1);
      pages.push(total);
    }

    this.pages = pages;
  }

  go(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.pageChange.emit(page);
  }
}
