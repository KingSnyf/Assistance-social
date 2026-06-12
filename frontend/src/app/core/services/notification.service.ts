import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Notification {
  id: number;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private notifications: Notification[] = [];
  private notificationSubject = new Subject<Notification[]>();
  public notifications$ = this.notificationSubject.asObservable();
  private idCounter = 0;

  show(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', duration: number = 4000): void {
    const notification: Notification = {
      id: ++this.idCounter,
      type,
      message,
      duration
    };
    this.notifications.push(notification);
    this.notificationSubject.next([...this.notifications]);

    if (duration > 0) {
      setTimeout(() => this.remove(notification.id), duration);
    }
  }

  success(message: string, duration: number = 4000): void {
    this.show(message, 'success', duration);
  }

  error(message: string, duration: number = 6000): void {
    this.show(message, 'error', duration);
  }

  warning(message: string, duration: number = 5000): void {
    this.show(message, 'warning', duration);
  }

  info(message: string, duration: number = 4000): void {
    this.show(message, 'info', duration);
  }

  remove(id: number): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.notificationSubject.next([...this.notifications]);
  }

  clear(): void {
    this.notifications = [];
    this.notificationSubject.next([]);
  }
}
