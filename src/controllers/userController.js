
import {db }from "../config/database.js";
import logger from "../utils/logger.js";

export const RegisterUser = async (req, res) => {
    try {
        logger.info("Creating user endpoint hit");
        
    } catch (error) {
        
    }

    res.status(200).json({
        message: "User created successfully",
        
    });
}

export const LoginUser = async (req, res) => {
    try {
        logger.info("Login user endpoint hit");
        
    } catch (error) {
        
    }

    res.status(200).json({
        message: "User logged in successfully",
       
    });
}


export const verifyEmail = async (req, res) => {
    try {
        logger.info("Verify email endpoint hit");
        
    } catch (error) {
        
    }

    res.status(200).json({
        message: "Email verified successfully",
       
    });
}


export const ResendVerificationEmail = async (req, res) => {
    try {
        logger.info("Resend verification email endpoint hit");
        
    } catch (error) {
        
    }

    res.status(200).json({
        message: "Verification email resent successfully",
       
    });
}


export const ForgotPassword = async (req, res) => {
    try {
        logger.info("Forgot password endpoint hit");
        
    } catch (error) {
        
    }

    res.status(200).json({
        message: "Password reset email sent successfully",
        
    });
}

export const ResetPassword = async (req, res) => {
    try {
        logger.info("Reset password endpoint hit");
        
    } catch (error) {
        
    }

    res.status(200).json({
        message: "Password reset successfully",
       
    });
}


export const LogoutUser = async (req, res) => {
    try {
        logger.info("Logout user endpoint hit");
        
    } catch (error) {
        
    }

    res.status(200).json({
        message: "User logged out successfully",
        data: user
    });
}



//generate username

export const generateUsername = async (req, res) => {
    try {
        logger.info("Generate username endpoint hit");
        
    } catch (error) {
        
    }
    res.status(200).json({
        message: "Username generated successfully",
       
    });
}


//get user profile

export const getUserProfile = async (req, res) => {
    try {
        logger.info("Get user profile endpoint hit");
        
    } catch (error) {
        
    }
    res.status(200).json({
        message: "User profile fetched successfully",
      
    });
}

//update user profile




