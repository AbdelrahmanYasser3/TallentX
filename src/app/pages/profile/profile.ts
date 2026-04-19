import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CandidateService } from '../../core/services/candidate.service';       
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html'
})
export class ProfilePage {
  public candidateService = inject(CandidateService);
  private toastService = inject(ToastService);

  isUploadingPicture = false;
  isUpdatingSkills = false;
  isUploadingResume = false;
  isDeletingResume = false;

  newSkill = '';

  private getSelectedFile(event: Event): File | null {
    const target = event.target as HTMLInputElement | null;
    if (!target?.files?.length) {
      return null;
    }

    return target.files[0] ?? null;
  }

  onPictureSelected(event: Event): void {
    const file = this.getSelectedFile(event);
    if (file) {
      if (!file.type.startsWith('image/')) {
        this.toastService.error('Please select an image file');
        return;
      }

      this.isUploadingPicture = true;
      this.candidateService.updateProfilePicture(file).subscribe({
        next: () => {
          this.isUploadingPicture = false;
          this.toastService.success('Profile picture updated successfully!');   
        },
        error: () => {
          this.isUploadingPicture = false;
          this.toastService.error('Failed to update profile picture.');
        }
      });
    }
  }

  addSkill(currentSkills: string[]): void {
    const skill = this.newSkill.trim();
    if (skill && !currentSkills.includes(skill)) {
      const updatedSkills = [...currentSkills, skill];
      this.saveSkills(updatedSkills);
      this.newSkill = '';
    }
  }

  removeSkill(skillToRemove: string, currentSkills: string[]): void {
    const updatedSkills = currentSkills.filter(s => s !== skillToRemove);       
    this.saveSkills(updatedSkills);
  }

  private saveSkills(skills: string[]): void {
    this.isUpdatingSkills = true;
    this.candidateService.updateSkills(skills).subscribe({
      next: () => {
        this.isUpdatingSkills = false;
        this.toastService.success('Skills updated successfully!');
      },
      error: () => {
        this.isUpdatingSkills = false;
        this.toastService.error('Failed to update skills.');
      }
    });
  }

  onUploadResume(event: Event): void {
    const file = this.getSelectedFile(event);
    if (file) {
      // Allow pdf and doc/docx
      if (file.type !== 'application/pdf' && !file.type.includes('wordprocessingml') && !file.type.includes('msword')) {
         this.toastService.error('Please upload a PDF or Word document');
         return;
      }

      this.isUploadingResume = true;
      this.candidateService.uploadResume(file).subscribe({
        next: () => {
          this.isUploadingResume = false;
          this.toastService.success('Resume uploaded successfully!');
        },
        error: () => {
          this.isUploadingResume = false;
          this.toastService.error('Failed to upload resume.');
        }
      });
    }
  }

  onDeleteResume(): void {
    if (confirm('Are you sure you want to delete your resume?')) {
      this.isDeletingResume = true;
      this.candidateService.getProfileDto().subscribe({
        next: (profile) => {
          const resumeId = profile?.resumes?.[0]?.id;
          if (!resumeId) {
            this.isDeletingResume = false;
            this.toastService.error('No resume found to delete.');
            return;
          }

          this.candidateService.deleteResume(String(resumeId)).subscribe({
            next: () => {
              this.isDeletingResume = false;
              this.toastService.success('Resume deleted successfully!');
            },
            error: () => {
              this.isDeletingResume = false;
              this.toastService.error('Failed to delete resume.');
            }
          });
        },
        error: () => {
          this.isDeletingResume = false;
          this.toastService.error('Failed to load profile before deleting resume.');
        }
      });
    }
  }

  downloadResume(): void {
    this.toastService.success('Downloading resume...');
    // Implement actual download logic here based on your backend response.
  }
}

