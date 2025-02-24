export type LogInRes = {
  username: string
  email: string
  jwt_token: string
}

export type ChangePwdReq = {
  hashed_password_current: string
  hashed_password_new: string
}
