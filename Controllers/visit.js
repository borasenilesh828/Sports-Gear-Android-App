const {PrismaClient} = require('@prisma/client')
const prisma = new PrismaClient()
const nodemailer = require('nodemailer');
const ejs = require('ejs');
const path = require('path');


exports.requestVisit = async(req,res)=>{
    try {
        const reqBodyData = req.body
        const visitor = await prisma.visitors.create({
            data:{
                name:reqBodyData.visitor_name,
                email:reqBodyData.visitor_email,
                phone:reqBodyData.visitor_phone,
                address:reqBodyData.visitor_address,
                to_meet:reqBodyData.visitor_to_meet,
                type_of_visit:reqBodyData.visitor_type,
                visit_date:new Date(reqBodyData.visitor_date),
                purpose:reqBodyData.visitor_purpose,
                visit_status:"PENDING",
                is_enabled:1
            }
        })
        const data = await prisma.users.findMany({
            select:{
                name:true
            }
        })
        
        const usernames =  data.map((user)=>user.name)
        usernames.unshift("----------------------------------Select---------------------------------")
        // sendVisitEmail(visitor)
        // sendVisitEmailToPerson(visitor)
        return res.render('visit',{
            isError:true,
            message:"Your visit request has been submitted !!",
            usernames:usernames
        })
    } catch (error) {
        console.log(error)
    }
}

const sendVisitEmail  = (visitor) =>{
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'email', // Your Gmail address
            pass: 'password',  // Your Gmail password (or App Password for better security)
        },
    });
    const templatePath = path.join(__dirname, '../views/visitEmail.ejs');
    visitor.message = `Hello ${visitor.name} your visit request is ${visitor.visit_status}. Below are the details:`
    const recipientEmail = 'recipientEmail@gmail.com';
    const templateVariables = {
        visitor:visitor
    };
  
  
    ejs.renderFile(templatePath, templateVariables, (err, htmlContent) => {
        if (err) {
            console.error('Error rendering EJS template:', err);
            return;
        }
    
        // Define email options
        const mailOptions = {
            from: 'sender@gmail.com', 
            to: recipientEmail,            
            subject: 'Visit Request', 
            html: htmlContent,
        };
    
        // Send the email
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                return res.render('forgotPassword',{
                    isError:true,
                    message:"Something went wrong !!!"
                })
            } else {
                console.log('Email sent:', info.response);
            
            }
        });
    });
}

const sendVisitEmailToPerson = (visitor) =>{
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'email',
            pass: 'password',
        },
    });
    const templatePath = path.join(__dirname, '../views/visitEmailToPerson.ejs');
    visitor.message = `Hello, ${visitor.to_meet}, A visitor ${visitor.name} has requested to visit you. Below are the details:`
    const recipientEmail = 'ajaykhandare862@gmail.com';
    const templateVariables = {
        visitor:visitor
    };
  
  
    ejs.renderFile(templatePath, templateVariables, (err, htmlContent) => {
        if (err) {
            console.error('Error rendering EJS template:', err);
            return;
        }
    
        // Define email options
        const mailOptions = {
            from: 'sender@gmail.com', 
            to: recipientEmail,            
            subject:`Visit Request`, 
            html: htmlContent,
        };
    
        // Send the email
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                return res.render('forgotPassword',{
                    isError:true,
                    message:"Something went wrong !!!"
                })
            } else {
                console.log('Email sent:', info.response);
            
            }
        });
    });
}
