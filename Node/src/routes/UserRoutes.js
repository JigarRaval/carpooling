const router = require("express").Router();
const userController = require("../controllers/UserController");

router.get("/users", userController.getAllUsers);
router.post("/adduser", userController.signUp);
router.post("/user/login", userController.loginUser);
router.delete("/user/:id", userController.deleteUser);
router.get("/user/:id", userController.getUserById);
router.get('/profile/:id', userController.getUserProfile);
router.put('/profile/:id', userController.updateUserProfile);
router.post("/user/forgotpassword", userController.forgotPassword)
router.post("/user/resetpassword", userController.resetpassword)


module.exports = router;