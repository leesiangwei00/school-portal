export interface Teacher {
  id: string;
  name: string;
  subject: string;
  email: string;
  contactNumber: string;
}

export interface SchoolClass {
  id: string;
  level: string;
  name: string;
  formTeacher: {
    name: string;
    email: string;
  };
}

export interface CreateTeacherInput {
  name: string;
  subject: string;
  email: string;
  contactNumber: string;
}

export interface CreateClassInput {
  level: string;
  name: string;
  teacherEmail: string;
}
