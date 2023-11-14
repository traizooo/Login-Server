
# **Node.js Login/Signup Server with Email and OTP Authentication**

### This repository contains a Node.js server implementation for user login and signup functionality with email and OTP (One-Time Password) authentication. The server is built using popular frameworks and libraries, offering a robust and secure authentication system. 

## **.env file structure:**

```bash
MONGODB_URI=<mongodb_uri>
AUTH_EMAIL=<auth_email>
AUTH_PASS=<auth_pass>
```

## **Features**

1. User registration: New users can sign up by providing their email address and choosing a password.
2. Email verification: A verification email is sent to the user's provided email address, containing a unique OTP.
3. OTP verification: Users need to enter the received OTP to verify their email address.
4. User login: Registered users can log in using their verified email address and password.
5. Password reset: Users can request a password reset email if they forget their password.
6. Token-based authentication: Upon successful login, users receive a JWT (JSON Web Token) which can be used for subsequent authenticated requests.
7. Middleware for authentication: The server includes middleware that ensures only authenticated requests are processed.
8. Error handling: Proper error handling is implemented to provide informative responses for various scenarios.

## **Start locally**

**Clone project**

```bash
  git clone https://github.com/traizooo/Login-Server.git
```

**Go to project's directory**

```bash
  cd `my-project`
```

**Install dependencies**

```bash
  npm install
```

**Start server**

```bash
  node `filename`
```


## **API Reference**

#### Sign up

```http
  POST /api/signup
```

#### Log in

```http
  GET /api/signin
```

#### Verify OTP

```http
  POST /api/verifyOTP
```

#### Resend OTP

```http
  POST /api/resendOTPVerificationCode
```

#### Verify by link

```http
  GET /api/verify/:userId/:uniqueString
```

#### Resend link

```http
  POST /api/resendVerificationLink
```

#### Verification successful

```http
  GET /api/verified
```

#### Password reset 

```http
  POST /api/requestPasswordReset
```

#### Request password reset 

```http
  POST /api/requestPasswordReset
```

#### Password reset 

```http
  POST /api/resetPassword
```

## **Author**

- [Michael Owsiejew](https://www.github.com/traizooo)


## Feedback
<<<<<<< HEAD

If you have any feedback, please reach out to me at michal.owsiejew23@gmail.com
=======
>>>>>>> 88b636f (Commit)

If you have any feedback, please reach out to me at michal.owsiejew23@gmail.com