import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, User as UserIcon, Mail, MoreVertical, Shield } from 'lucide-angular';
import { UserOut } from '../../../models/user.model';

@Component({
  selector: 'app-user-card',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './user-card.html',
  styleUrls: ['./user-card.scss']
})
export class UserCard {
  readonly UserIcon = UserIcon;
  readonly Mail = Mail;
  readonly MoreVertical = MoreVertical;
  readonly Shield = Shield;

  @Input({ required: true }) user!: UserOut;
  @Output() edit = new EventEmitter<number>();
  @Output() changePermissions = new EventEmitter<number>();
  @Output() resetPassword = new EventEmitter<number>();
  @Output() deactivate = new EventEmitter<number>();

  showMenu = false;

  get initials(): string {
    return `${this.user.nombre[0]}${this.user.apellido1[0]}`.toUpperCase();
  }

  get fullName(): string {
    return `${this.user.nombre} ${this.user.apellido1}`;
  }

  toggleMenu(): void {
    this.showMenu = !this.showMenu;
  }

  onEdit(): void {
    this.showMenu = false;
    this.edit.emit(this.user.usuario_id);
  }

  onChangePermissions(): void {
    this.showMenu = false;
    this.changePermissions.emit(this.user.usuario_id);
  }

  onResetPassword(): void {
    this.showMenu = false;
    this.resetPassword.emit(this.user.usuario_id);
  }

  onDeactivate(): void {
    this.showMenu = false;
    this.deactivate.emit(this.user.usuario_id);
  }
}