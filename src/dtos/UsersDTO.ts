export interface UserOnboarding {
  name: string;
  email: string;
  phone: string;
  document: string;
  bcrypt_user_password: string;
  birthday?: Date;
}

export interface UserAuthOnboarding {
  bcrypt_user_password: string;
}

export interface UserInfoOnboarding {
  id: string;
  document: string;
  name: string;
  email: string;
  phone: string;
  birthday?: Date;
}

export interface UserOut {
  id: string;
  email: string;
  name: string;
}
