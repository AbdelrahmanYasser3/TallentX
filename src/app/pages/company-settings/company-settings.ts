import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CompanyService } from '../../core/services/company.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { InviteCodeDto } from '../../core/models/company.models';

@Component({
  selector: 'app-company-settings-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './company-settings.html',
})
export class CompanySettingsPage implements OnInit {
  private companyService = inject(CompanyService);
  private authService = inject(AuthService);
  private toast = inject(ToastService);

  inviteCodes = signal<InviteCodeDto[]>([]);
  isLoadingCodes = signal<boolean>(false);
  isGenerating = signal<boolean>(false);
  showGenerateForm = signal<boolean>(false);

  // Form fields for generating new code
  maxUses = signal<number>(5);
  validDays = signal<number>(30);

  ngOnInit(): void {
    this.loadInviteCodes();
  }

  loadInviteCodes(): void {
    const companyId = this.authService.getCompanyId();
    if (!companyId) return;

    this.isLoadingCodes.set(true);
    this.companyService.getInviteCodes(companyId).subscribe({
      next: (codes) => {
        this.inviteCodes.set(codes);
        this.isLoadingCodes.set(false);
      },
      error: () => {
        this.toast.error('Failed to load invite codes');
        this.isLoadingCodes.set(false);
      }
    });
  }

  generateNewCode(): void {
    const companyId = this.authService.getCompanyId();
    if (!companyId) return;

    if (this.maxUses() <= 0 || this.validDays() <= 0) {
      this.toast.error('Please enter valid values');
      return;
    }

    this.isGenerating.set(true);
    this.companyService.generateInviteCode(companyId, {
      maxUses: this.maxUses(),
      validDaysFromNow: this.validDays()
    }).subscribe({
      next: (response) => {
        this.toast.success(`Code generated: ${response.code}`);
        this.maxUses.set(5);
        this.validDays.set(30);
        this.showGenerateForm.set(false);
        this.isGenerating.set(false);
        this.loadInviteCodes(); // Reload the list
      },
      error: () => {
        this.toast.error('Failed to generate invite code');
        this.isGenerating.set(false);
      }
    });
  }

  revokeCode(codeId: number): void {
    const companyId = this.authService.getCompanyId();
    if (!companyId) return;

    if (!confirm('Are you sure you want to revoke this invite code?')) return;

    this.companyService.revokeInviteCode(companyId, codeId).subscribe({
      next: () => {
        this.toast.success('Invite code revoked');
        this.loadInviteCodes();
      },
      error: () => {
        this.toast.error('Failed to revoke invite code');
      }
    });
  }

  copyToClipboard(code: string): void {
    navigator.clipboard.writeText(code).then(() => {
      this.toast.success('Code copied to clipboard');
    }).catch(() => {
      this.toast.error('Failed to copy code');
    });
  }

  isCodeExpired(expiresAt: string): boolean {
    return new Date(expiresAt) < new Date();
  }

  isCodeExhausted(code: InviteCodeDto): boolean {
    return code.currentUses >= code.maxUses;
  }

  getDaysUntilExpiry(expiresAt: string): number {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }
}
