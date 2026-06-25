// import mongoose, { Document, Model, Schema } from "mongoose";
// import bcrypt from "bcrypt";

// // ----------------------------
// // 1️⃣ Define an interface for User
// // ----------------------------
// export interface IUser extends Document {
//   name: string;
//   phone: string;
//   password: string;
//   profileImage?: string | null;
//   customer?: mongoose.Types.ObjectId;
//   location: mongoose.Types.ObjectId;
//   shift: mongoose.Types.ObjectId;
//   createdAt: Date;
//   refreshToken?: string | null;
//   role: "user";
//   loginVerificationCode?: string;

//   // Instance methods (if any)
// }

// export interface IUserModel extends Model<IUser> {
//   login(phone: string, password: string): Promise<IUser>;
//   mobileLogin(mobile: string, code: string): Promise<IUser>;
// }

// // ----------------------------
// // 2️⃣ Define the schema
// // ----------------------------
// const userSchema = new Schema<IUser, IUserModel>({
//   name: {
//     type: String,
//     required: true,
//   },
//   phone: {
//     type: String,
//     required: true,
//     unique: true,
//   },
//   password: {
//     type: String,
//     required: true,
//   },
//   profileImage: {
//     type: String,
//     default: null,
//   },
//   customer: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Customer",
//   },
//   location: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Location",
//     required: true,
//   },
//   shift: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Shift",
//     required: true,
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
//   refreshToken: {
//     type: String,
//     default: null,
//   },
// });

// // ----------------------------
// // 3️⃣ Static methods
// // ----------------------------
// userSchema.statics.login = async function (
//   phone: string,
//   password: string
// ): Promise<IUser> {
//   const user = await this.findOne({ phone });
//   if (!user) throw new Error("نام کاربری یا رمز عبور اشتباه است");

//   const auth = await bcrypt.compare(password, user.password);
//   if (!auth) throw new Error("نام کاربری یا رمز عبور اشتباه است");

//   return user;
// };

// userSchema.statics.mobileLogin = async function (
//   mobile: string,
//   code: string
// ): Promise<IUser> {
//   const user = await this.findOne({ phone: mobile }); // changed mobile to phone in schema
//   if (!user) throw new Error("mobile or password is wrong");

//   if (user.loginVerificationCode !== code) {
//     throw new Error("the code you have sent is not valid");
//   }

//   return user;
// };

// // ----------------------------
// // 4️⃣ Export the model
// // ----------------------------
// const User = mongoose.model<IUser, IUserModel>("User", userSchema);
// export default User;


import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from "bcrypt";

interface IOtp {
  code?: string;
  expiresIn?: Date;
}

export interface IUser extends Document {
  name: string;
  phone: string;
  password: string;
  profileImage?: string | null;
  customer?: mongoose.Types.ObjectId;
  location: mongoose.Types.ObjectId;
  shift: mongoose.Types.ObjectId;
  createdAt: Date;
  refreshToken?: string | null;
  role: "user";

  otp?: IOtp;
}

export interface IUserModel extends Model<IUser> {
  login(phone: string, password: string): Promise<IUser>;
}

const userSchema = new Schema<IUser, IUserModel>({
  name: {
    type: String,
    required: true,
  },

  phone: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },

  profileImage: {
    type: String,
    default: null,
  },

  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
  },

  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Location",
    required: true,
  },

  shift: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Shift",
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  refreshToken: {
    type: String,
    default: null,
  },

  otp: {
    code: {
      type: String,
      default: null,
    },

    expiresIn: {
      type: Date,
      default: null,
    },
  },
});

userSchema.pre<IUser>("save", async function () {
  if (
    this.isModified("password") ||
    this.isNew
  ) {
    const salt = await bcrypt.genSalt(10);

    this.password = await bcrypt.hash(
      this.password,
      salt
    );
  }
});

userSchema.statics.login = async function (
  phone: string,
  password: string
): Promise<IUser> {
  const user = await this.findOne({ phone });

  if (!user) {
    throw new Error(
      "نام کاربری یا رمز عبور اشتباه است"
    );
  }

  const auth = await bcrypt.compare(
    password,
    user.password
  );

  if (!auth) {
    throw new Error(
      "نام کاربری یا رمز عبور اشتباه است"
    );
  }

  return user;
};

const User = mongoose.model<IUser, IUserModel>(
  "User",
  userSchema
);

export default User;



