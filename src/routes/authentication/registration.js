const router = require("express").Router();

const bcrypt=require("bcrypt");
const PendingUser = require("../../models/pending-user");

const {generateConfirmationCode} = require("../../utils/codeGenerator");

const {sendConfirmationEmail} = require("../../utils/mailingServcies");

router.post("/register",async (request,respone) => {
    const { username, email, password, confirmPassword, phone } = request.body;


    if (password !== confirmPassword) {
        return respone.status(400).json({ message: "Passwords do not match" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 12);

        const verficationCode = generateConfirmationCode();

        const newUser = new PendingUser({
            username,
            email,
            password: hashedPassword,
            phone,
            verficationCode
        });
    
        await newUser.save();
        await sendConfirmationEmail(email,username,verficationCode);
        
        return respone.status(200).json({ message: "Registration successful. Please check your email for the verification code." });
    } catch (error) {
        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            const duplicateValue = error.keyValue[field];
            return respone.status(409).json({
                field,
                message: `The ${field} '${duplicateValue}' is already in use. Please choose a different one.`,
            });
          }
        if (error.name === 'ValidationError') {
            const field = Object.keys(error.keyValue)[0];
            const duplicateValue = error.keyValue[field];
            return respone.status(409).json({field,message:error.errors[field].message})
        }
        return respone.status(500).json({ message: 'Server error' });
        
    }
});

module.exports=router;