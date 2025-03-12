const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const util = require('../util')
const crypto = require('crypto')
const nodemailer = require('nodemailer');
const ejs = require('ejs');
const path = require('path');

exports.userSignup = async (req, res) => {
    try {
        const reqBodyData = req.body
        const isUserExist = await checkAdminExists(reqBodyData.email)
        if (!util.isNull(isUserExist)) {
            return res.render('signup', {
                isError: true,
                message: "User alredy exist !! Please login."
            })
        }

        return proccedToSignUp(reqBodyData, res,req)
    } catch (error) {
        console.log(error)
        res.send({
            status: {
                code: -1,
                message: "Something went wrong !!!"
            }
        })
    }
}


const checkAdminExists = async (email) => {
    return await prisma.admin.findFirst({
        where: {
            email: email
        }
    })
}

const proccedToSignUp = async (reqBodyData, res,req) => {
    try {
        const data = await prisma.admin.create({
            data: {
                name: reqBodyData.name,
                email: reqBodyData.email,
                phone: reqBodyData.phone,
                password: generateHash(reqBodyData.password),
                is_enabled: 1,
                role: 1
            }
        })
        req.session.admin =  data // storing admin in session
        const list = await getDetailsForDashboard()
        return res.render('dashboard', {
            list,
            isError: false,
            message: "",
            admin:req.session.admin
        })
    } catch (error) {
        console.log(error)
    }
}

/* Hash password
* @param {string} password 
* @returns {string} - password in hash
*/
function generateHash(password) {

    const hash = crypto.createHash('sha512');
    const hashBuffer = hash.update(password, 'utf-8').digest();
    const hashString = hashBuffer.toString('hex');
    return hashString;
}

exports.userLogin = async (req, res) => {
    try {
        const reqBodyData = req.body
        const isUserExist = await checkAdminExists(reqBodyData.email)
        if (util.isNull(isUserExist)) {
            return res.render('login', {
                isError: true,
                message: "Email does not found."
            })
        }
        return checkValidPasswordAndLogin(reqBodyData, req,res)
    } catch (error) {
        console.log(error)
    }
}

const checkValidPasswordAndLogin = async (reqBodyData, req, res) => {
    const hashPassword = crypto.createHash('sha512').update(reqBodyData.password).digest('hex');
    const user = await getAdminByEmail(reqBodyData.email)

    if (hashPassword !== user.password) {
        return res.render('login', {
            isError: true,
            message: "Password does not match."
        })
    }
   
    req.session.admin =  user // storing admin in sessio
    const list = await getDetailsForDashboard()
    return res.render('dashboard', {
        isError: false,
        message: "",
        list:list,
        admin:req.session.admin
    })
}


async function getDetailsForDashboard(){
    const totalUsers = await prisma.users.count({where:{is_enabled:1}})
    const totalVisits = await prisma.visitors.count({where:{is_enabled:1}})
    const totalPendingVisits = await getVisitsByStatus("PENDING")
    const totalApprovedVisits = await getVisitsByStatus("APPROVED")
    const totalRejectedVisits = await getVisitsByStatus("REJECTED")
    return  list ={
        totalUsers:totalUsers,
        totalVisits:totalVisits,
        totalPendingVisits:totalPendingVisits.length,
        totalApprovedVisits:totalApprovedVisits.length,
        totalRejectedVisits:totalRejectedVisits.length,
    }
}


const getAdminByEmail = async (email) => {
    return await prisma.admin.findFirst({
        where: {
            email: email
        }
    })
}

exports.forgotPassword = async (req, res) => {
    try {
        const reqBodyData = req.body
        const isUserExist = await checkAdminExists(reqBodyData.email)
        if (util.isNull(isUserExist)) {
            return res.render('forgotPassword', {
                isError: true,
                message: "Email does not exist."
            })
        }
        return createHashAndSendEmail(reqBodyData, res)
    } catch (error) {
        console.log(error)
    }
}


const createHashAndSendEmail = async (reqBodyData, res) => {
    try {
        const admin = await getAdminByEmail(reqBodyData.email)

        const generateHash = await prisma.admin.update({
            where: {
                id: admin.id
            },
            data: {
                hash: crypto.randomUUID()
            }
        })

        return sendEmail(generateHash, res)
    } catch (error) {
        console.log(error)
    }
}

const sendEmail = (data, res) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'email', // Your Gmail address
            pass: 'password',  // Your Gmail password (or App Password for better security)
        },
    });
    const templatePath = path.join(__dirname, '../views/forgotPasswordEmail.ejs');

    const recipientEmail = 'recipientEmail@gmail.com';

    // EJS template variables
    const templateVariables = {
        username: data.name,
        resetLink: `http://localhost:4001/admin/reset-password/${data.hash}`
    };

    ejs.renderFile(templatePath, templateVariables, (err, htmlContent) => {
        if (err) {
            console.error('Error rendering EJS template:', err);
            return;
        }

        // Define email options
        const mailOptions = {
            from: 'senderEmail@gmail.com',  // Sender email address
            to: recipientEmail,             // Recipient email address
            subject: 'Reset your password !', // Email subject
            html: htmlContent,               // HTML content generated from EJS template
        };

        // Send the email
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                return res.render('forgotPassword', {
                    isError: true,
                    message: "Something went wrong !!!"
                })
            } else {
                return res.render('forgotPassword', {
                    isError: true,
                    message: "Reset password email has been sent to your email."
                })
            }
        });
    });
}

exports.resetPassword = async (req, res) => {
    try {
        const reqBodyData = req.body
        if (reqBodyData.password !== reqBodyData.cpassword) {
            return res.render('resetPassword', {
                hash: req.body.hash,
                isError: true,
                message: "Password and confirm password does not matched !"
            })
        }
        return resetAdminPassword(reqBodyData, res)
    } catch (error) {
        console.log(error)
    }
}

const resetAdminPassword = async (reqBodyData, res) => {
    const admin = await prisma.admin.findFirst({
        where: {
            hash: reqBodyData.hash
        },
    })

    const updatePassword = await prisma.admin.update({
        where: {
            id: admin.id
        },
        data: {
            password: generateHash(reqBodyData.password),
            hash: null
        }
    })


    return res.render('login', {
        isError: true,
        message: "Password has been reset successfully !"
    })


}

exports.pendingVisits = async (req, res) => {
    try {
        const data = await prisma.visitors.findMany({
            orderBy: { created_at: 'desc' },
            where: {
                visit_status: "PENDING",
                is_enabled: 1
            }
        })
        return res.render('pendingVIsits', {
            visitsData: data,
            isError: false,
            message: ""
        })
    } catch (error) {
        console.log(error)
    }
}

exports.approvedVisits = async (req, res) => {
    try {
        const data = await prisma.visitors.findMany({
            orderBy: { created_at: 'desc' },
            where: {
                visit_status: "APPROVED",
                is_enabled: 1
            }
        })
        return res.render('approvedVisits', {
            visitsData: data,
            isError: false,
            message: ""
        })
    } catch (error) {
        console.log(error)
    }
}
exports.rejectedVisits = async (req, res) => {
    try {
        const data = await prisma.visitors.findMany({
            orderBy: { created_at: 'desc' },
            where: {
                visit_status: "REJECTED",
                is_enabled: 1
            }
        })
        return res.render('rejectedVisits', {
            visitsData: data,
            isError: false,
            message: ""
        })
    } catch (error) {
        console.log(error)
    }
}

exports.rejectVisit = async (req, res) => {
    try {
        const pendingVisits = await getVisitsByStatus('PENDING')
        const data = await prisma.visitors.update({
            where: {
                id: req.params.id
            },
            data: {
                visit_status: "REJECTED"
            }
        })
        // sendVisitEmailToVisitor(data, 2)
        // sendVisitEmailToPerson(data, 2)

        return res.render('dashboard', {
            isError: true,
            message: "Visits details has been rejected",
            visitsData: pendingVisits,
            admin:req.session.admin

        })
    } catch (error) {
        console.log(error)
    }
}

exports.approveVisit = async (req, res) => {
    try {
        const pendingVisits = await getVisitsByStatus('PENDING')
        const data = await prisma.visitors.update({
            where: {
                id: req.params.id
            },
            data: {
                visit_status: "APPROVED"
            }
        })
        // sendVisitEmailToVisitor(data, 3)
        // sendVisitEmailToPerson(data, 3)
        return res.render('dashboard', {
            isError: true,
            message: "Visits details has been approved",
            visitsData: pendingVisits,
            admin:req.session.admin

        })
    } catch (error) {
        console.log(error)
    }
}

exports.pendingVisit = async (req, res) => {
    try {
        const pendingVisits = await getVisitsByStatus('PENDING')
        const data = await prisma.visitors.update({
            where: {
                id: req.params.id
            },
            data: {
                visit_status: "PENDING"
            }
        })
        // sendVisitEmailToVisitor(data, 1)

        return res.render('dashboard', {
            isError: true,
            message: "Visits details has been moved to pending.",
            visitsData: pendingVisits,
            admin:req.session.admin

        })
    } catch (error) {
        console.log(error)
    }
}


const getVisitsByStatus = async (status) => {
    return await prisma.visitors.findMany({
        where: {
            visit_status: status
        }
    })
}

exports.requestVisit = async (req, res) => {
    try {
        const reqBodyData = req.body
        const visitor = await prisma.visitors.create({
            data: {
                name: reqBodyData.visitor_name,
                email: reqBodyData.visitor_email,
                phone: reqBodyData.visitor_phone,
                address: reqBodyData.visitor_address,
                to_meet: reqBodyData.visitor_to_meet,
                type_of_visit: reqBodyData.visitor_type,
                visit_date: new Date(reqBodyData.visitor_date),
                purpose: reqBodyData.visitor_purpose,
                visit_status: "PENDING",
                is_enabled: 1
            }
        })
        const data = await prisma.users.findMany({
            select: {
                name: true
            }
        })
        const usernames = data.map((user) => user.name)
        usernames.unshift("----------------------------------Select---------------------------------")
        sendVisitEmailToPerson(visitor, 1)
        sendVisitEmailToVisitor(visitor, 1)
        return res.render('addVisits', {
            isError: true,
            message: "Your visit request has been submitted !!",
            usernames: usernames
        })
    } catch (error) {
        console.log(error)
    }
}

exports.addUser = async (req, res) => {
    try {
        const reqBodyData = req.body
        const isUserExist = await checkUsernExists(reqBodyData.email)
        if (!util.isNull(isUserExist)) {
            return res.render('addUser', {
                isError: true,
                message: "User alredy exist !! Please login."
            })
        }
        return proccedToCreateUser(reqBodyData, res)
    } catch (error) {
        console.log(error)
    }
}

const checkUsernExists = async (email) => {
    return await prisma.users.findFirst({
        where: {
            email: email

        }
    })
}

const proccedToCreateUser = async (reqBodyData, res) => {
    try {
        const data = await prisma.users.create({
            data: {
                name: reqBodyData.name,
                email: reqBodyData.email,
                phone: reqBodyData.phone,
                address: reqBodyData.address,
                is_enabled: 1
            }
        })

        return res.render('addUser', {
            isError: true,
            message: "User details has been created successfully."
        })
    } catch (error) {
        console.log(error)
    }
}

const sendVisitEmailToVisitor = (visitor, type) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'email', // Your Gmail address
            pass: 'password',  // Your Gmail password (or App Password for better security)
        },
    });
    const templatePath = path.join(__dirname, '../views/visitEmail.ejs');
    let message = ""
    switch (type) {
        case 1:
            message += `Hello, ${visitor.name}, you have raised a visit request to visit ${visitor.to_meet}. Below are the details:`
            break;

        case 2:
            message += `Hello, ${visitor.name}, your visit request with ${visitor.to_meet} has been Rejected. Below are the details:`
            break

        case 3:
            message += `Hello, ${visitor.name}, your visit request with ${visitor.to_meet} has been Approved. Below are the details:`
            break
    }
    visitor.message = message
    const recipientEmail = 'recipientEmail@gmail.com';
    const templateVariables = {
        visitor: visitor
    };


    ejs.renderFile(templatePath, templateVariables, (err, htmlContent) => {
        if (err) {
            console.error('Error rendering EJS template:', err);
            return;
        }

        // Define email options
        const mailOptions = {
            from: 'senderEmail@gmail.com',
            to: recipientEmail,
            subject: `Visit Request ${visitor.visit_status}`,
            html: htmlContent,
        };

        // Send the email
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
             
            } else {
                console.log('Email sent:', info.response);

            }
        });
    });
}

const sendVisitEmailToPerson = (visitor, type) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'email', // Your Gmail address
                pass: 'password',  // Your Gmail password (or App Password for better security)
            },
        });
        let message = ""
        switch (type) {
            case 1:
                message += `Hello, ${visitor.to_meet}, A visitor ${visitor.name} has requested to visit you. Below are the details:`
                break;

            case 2:
                message += `Hello, ${visitor.to_meet}, your visit request with ${visitor.name} has been Rejected. Below are the details:`
                break

            case 3:
                message += `Hello, ${visitor.to_meet}, your visit request with ${visitor.name} has been Approved. Below are the details:`
                break
        }
        const recipientEmail = 'ajaykhandare862@gmail.com';
        visitor.message = message
        const templateVariables = {
            visitor: visitor
        };

        const templatePath = path.join(__dirname, '../views/visitEmailToPerson.ejs');
        ejs.renderFile(templatePath, templateVariables, (err, htmlContent) => {
            if (err) {
                console.error('Error rendering EJS template:', err);
                return;
            }

            // Define email options
            const mailOptions = {
                from: 'senderEmail@gmail.com',
                to: recipientEmail,
                subject: `Visit Request`,
                html: htmlContent,
            };

            // Send the email
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('Error sending email:', error);
                    return res.render('forgotPassword', {
                        isError: true,
                        message: "Something went wrong !!!"
                    })
                } else {
                    console.log('Email sent:', info.response);

                }
            });
        });
    } catch (error) {
        console.log(error)
    }

}


exports.searchVisits = async (req, res) => {
    try {
        const reqBodyData = req.body
        let filter = {}
        let visitsData = await getVisitsByStatus(reqBodyData.type)
        if (reqBodyData.filter === '') {
            return res.render(reqBodyData.page, {
                visitsData: visitsData,
                isError: true,
                message: "Plese serach by email or name"
            })
        }
        filter = reqBodyData.search === 'name' ? { name: { equals: reqBodyData.filter.trim() } } : { email: { equals: reqBodyData.filter.trim() } }
        filter.visit_status = reqBodyData.type
        const data = await prisma.visitors.findMany({
            where: filter
        })

        return res.render(reqBodyData.page, {
            visitsData: data,
            isError: false,
            message: ""
        })
    } catch (error) {
        console.log(error)
    }
}
