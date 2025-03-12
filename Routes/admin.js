const express = require('express')
const router =express.Router()
const userController = require('../Controllers/admin')
const {PrismaClient} = require('@prisma/client')
const prisma = new PrismaClient()
const isAuth = require('../middleware/auth')
router.post('/signup',userController.userSignup)

router.post('/login',userController.userLogin)

router.post('/forgot-password',userController.forgotPassword)

router.get('/login', (req, res) => {
    res.render('login', {
        isError: false,
        message: ""
    })
})

router.get('/signup', (req, res) => {
    res.render('signup', {
        isError: false,
        message: ""
    })
})


router.get('/reset-password/:token',(req,res)=>{
    res.render('resetPassword',{
        hash:req.params.token,
        isError:false,
        message:"Reset password email has been sent to your email."
    })
})

router.post('/reset-password',userController.resetPassword)

router.get('/dashboard', isAuth ,async(req,res)=>{
    const totalUsers = await prisma.users.count({where:{is_enabled:1}})
    const totalVisits = await prisma.visitors.count({where:{is_enabled:1}})
    const totalApprovedVisits = await getVisitsByStatus('APPROVED') 
    const totalPendingVisits = await getVisitsByStatus('PENDING') 
    const totalRejectedVisits = await getVisitsByStatus('REJECTED') 
    const list ={
        totalUsers:totalUsers,
        totalVisits:totalVisits,
        totalPendingVisits:totalPendingVisits.length,
        totalApprovedVisits:totalApprovedVisits.length,
        totalRejectedVisits:totalRejectedVisits.length,
    }
    res.render('dashboard',{
        isError:false,
        message:"",
        list:list,
        admin:req.session.admin

    })
})

router.get('/add-visits', isAuth, async(req,res)=>{
    const data = await prisma.users.findMany({
        orderBy:{created_at:'desc'},
        select:{
            name:true
        }
    })
    const usernames =  data.map((user)=>user.name)
    usernames.unshift("----------------------------------Select---------------------------------")
    res.render('addVisits',{
        usernames:usernames,
        isError:false,
        message:""
    })
})

router.get('/pending-visits', isAuth ,userController.pendingVisits)

router.get('/approved-visits',isAuth ,userController.approvedVisits)

router.get('/rejected-visits',isAuth,userController.rejectedVisits)

router.get('/reject-visit/:id',isAuth,userController.rejectVisit)

router.get('/approve-visit/:id',isAuth,userController.approveVisit)

router.get('/pending-visit/:id',isAuth,userController.pendingVisit)

router.post('/request-visit',isAuth,userController.requestVisit)

router.post('/search-visits',isAuth,userController.searchVisits)

router.post('/add-user',isAuth,userController.addUser)

router.get('/add-user',isAuth,(req,res)=>{
    res.render('addUser',{
        isError:false,
        message:""
    })
})
router.get('/profile',isAuth,(req,res)=>{
    res.render('profile',{
        isError:false,
        message:""
    })
})

router.get('/logout',(req,res)=>{
    console.log('admin logging out')
    req.session.destroy()
    res.redirect('/')
})

const getVisitsByStatus = async (status) => {
    return await prisma.visitors.findMany({
        where: {
            visit_status: status
        }
    })
}
module.exports = router
