import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {  ReactiveFormsModule, Validators, FormGroup, FormControl , FormArray} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';


@Component({
  selector: 'app-create-job-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './create-job.html',
  styleUrl: './create-job.css'
})
export class CreateJobPage {

    departments = ['Engineering', 'Product', 'Design'];
EmploymentType = ['Full-time', 'Part-time', 'Contract', 'Internship'];
PriorityS = ['High', 'Low', 'None'];

newJobForm: FormGroup = new FormGroup({

  department: new FormControl('', Validators.required),
  employmentType: new FormControl('', Validators.required),

  GPA: new FormControl('', Validators.required),
  GPAPriority: new FormControl('', Validators.required),

  ExperienceMinYears: new FormControl('', Validators.required),
  ExperienceMaxYears: new FormControl('', Validators.required),
  ExperiencePriority: new FormControl('', Validators.required),

  // ✅ FormArray للـ Degrees
  degrees: new FormArray([]),

  // ✅ FormArray للـ Roles
  roles: new FormArray([]),

  // ✅ FormArray للـ Skills
  skills: new FormArray([])

});

// ===== Getters =====

get department() { return this.newJobForm.get('department'); }
get employmentType() { return this.newJobForm.get('employmentType'); }
get GPA() { return this.newJobForm.get('GPA'); }
get GPAPriority() { return this.newJobForm.get('GPAPriority'); }
get ExperienceMinYears() { return this.newJobForm.get('ExperienceMinYears'); }
get ExperienceMaxYears() { return this.newJobForm.get('ExperienceMaxYears'); }
get ExperiencePriority() { return this.newJobForm.get('ExperiencePriority'); }

// ✅ Getters للـ FormArrays
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



onSubmit(){
  console.log(this.newJobForm.value);
}


}

