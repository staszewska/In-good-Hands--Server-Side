let userSchema = mongoose.Schema({
  Email: { type: String, required: true },
  Password: { type: String, required: true },
});

let User = mongoose.model("User", userSchema);
module.exports.User = User;
