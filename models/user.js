import mongoose from "mongoose";

// try {
//   const conn = await mongoose.createConnection(
//     "mongodb://localhost:27017/authentication",
//     {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     }
//   );
//   console.log("Successfully connected to mongoDB of authentication");
// } catch (error) {
//   console.log("Connection failed.");
//   console.error(error);
// }

const userSchema = new mongoose.Schema({
  username: {
    type: String,
  },
  password: {
    type: String,
  },
});

const User = mongoose.model("User", userSchema);

export default User;
