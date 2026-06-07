import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, Validators, FormGroup, FormControl, FormArray } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CreateJobService } from '../../core/services/create-jop.service';
import { ToastService } from '../../core/services/toast.service';

// ===== Interfaces =====

export type Priority = 'High' | 'Low' | 'None';

export interface DegreeItem {
  degreeName: string;
  degreePriority: Priority;
}

export interface RoleItem {
  roleName: string;
  rolePriority: Priority;
}

export interface SkillItem {
  skillName: string;
  skillPriority: Priority;
}

export interface NewJobFormValue {
  title: string;
  location: string;
  MinSalary: string;
  MaxSalary: string;

  // ✅ الـ fields الجديدة
  EducationDiscription: string;
  ExperienceDiscription: string;
  TechnicalSkillDiscription: string;
  JobDiscription: string;

  department: string;
  employmentType: string;
  GPA: string;
  GPAPriority: Priority;
  ExperienceMinYears: string;
  ExperienceMaxYears: string;
  ExperiencePriority: Priority;
  degrees: DegreeItem[];
  roles: RoleItem[];
  skills: SkillItem[];
}

// ===== Component =====

@Component({
  selector: 'app-create-job-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './create-job.html',
  styleUrl: './create-job.css'
})
export class CreateJobPage {

  // ===== Services =====
  private createJobService = inject(CreateJobService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  // ===== Dropdowns Data =====
  departments = ['Engineering', 'Product', 'Design'];
  EmploymentType = ['Full-time', 'Part-time', 'Contract', 'Internship'];
  PriorityS: Priority[] = ['High', 'Low', 'None'];

  // ===== Form =====
  newJobForm: FormGroup = new FormGroup({
    title: new FormControl('', Validators.required),
    location: new FormControl('', Validators.required),
    MinSalary: new FormControl('', Validators.required),
    MaxSalary: new FormControl('', Validators.required),

    EducationDiscription: new FormControl('', Validators.required),
    ExperienceDiscription: new FormControl('', Validators.required),
    TechnicalSkillDiscription: new FormControl('', Validators.required),
    JobDiscription: new FormControl('', Validators.required),

    department: new FormControl('', Validators.required),
    employmentType: new FormControl('', Validators.required),
    GPA: new FormControl('', [Validators.required, Validators.min(0), Validators.max(4)]),
    GPAPriority: new FormControl('', Validators.required),
    ExperienceMinYears: new FormControl('', Validators.required),
    ExperienceMaxYears: new FormControl('', Validators.required),
    ExperiencePriority: new FormControl('', Validators.required),
    degrees: new FormArray([]),
    roles: new FormArray([]),
    skills: new FormArray([])
  });

  // ===== Getters =====

  get title() { return this.newJobForm.get('title'); }
  get location() { return this.newJobForm.get('location'); }
  get MinSalary() { return this.newJobForm.get('MinSalary'); }
  get MaxSalary() { return this.newJobForm.get('MaxSalary'); }

  // ✅ الـ getters الجديدة
  get EducationDiscription() { return this.newJobForm.get('EducationDiscription'); }
  get ExperienceDiscription() { return this.newJobForm.get('ExperienceDiscription'); }
  get TechnicalSkillDiscription() { return this.newJobForm.get('TechnicalSkillDiscription'); }
  get JobDiscription() { return this.newJobForm.get('JobDiscription'); }

  get department() { return this.newJobForm.get('department'); }
  get employmentType() { return this.newJobForm.get('employmentType'); }
  get GPA() { return this.newJobForm.get('GPA'); }
  get GPAPriority() { return this.newJobForm.get('GPAPriority'); }
  get ExperienceMinYears() { return this.newJobForm.get('ExperienceMinYears'); }
  get ExperienceMaxYears() { return this.newJobForm.get('ExperienceMaxYears'); }
  get ExperiencePriority() { return this.newJobForm.get('ExperiencePriority'); }

  get degrees() { return this.newJobForm.get('degrees') as FormArray; }
  get roles() { return this.newJobForm.get('roles') as FormArray; }
  get skills() { return this.newJobForm.get('skills') as FormArray; }

  // ===== Degrees Methods =====

  addDegree() {
    this.degrees.push(
      new FormGroup({
        degreeName: new FormControl('', Validators.required),
        degreePriority: new FormControl('', Validators.required)
      })
    );
  }

  removeDegree(index: number) {
    this.degrees.removeAt(index);
  }

  // ===== Roles Methods =====

  addRole() {
    this.roles.push(
      new FormGroup({
        roleName: new FormControl('', Validators.required),
        rolePriority: new FormControl('', Validators.required)
      })
    );
  }

  removeRole(index: number) {
    this.roles.removeAt(index);
  }

  // ===== Skills Methods =====

  addSkill() {
    this.skills.push(
      new FormGroup({
        skillName: new FormControl('', Validators.required),
        skillPriority: new FormControl('', Validators.required)
      })
    );
  }

  removeSkill(index: number) {
    this.skills.removeAt(index);
  }

  // ===== Submit =====

  onSubmit() {
    if (this.newJobForm.invalid) {
      this.newJobForm.markAllAsTouched();
      this.toastService.error('Please fill in all required fields before publishing.');
      return;
    }

    const formValue = this.newJobForm.value as NewJobFormValue;

    this.createJobService.createJob(formValue).subscribe({
      next: (response) => {
        console.log('Job created successfully', response);
        this.toastService.success('Job published successfully!');
        this.router.navigate(['/jobs']);
      },
      error: (err) => {
        console.error('Error creating job:', err);
      }
    });
  }

}