const express = require('express')
const router = express.Router()
const {PrismaClient} = require('@prisma/client')
const prisma = new PrismaClient()
const excel = require('exceljs');

router.get('/', (req, res) => {
    res.render('home')
})

router.get('/about', (req, res) => {
    res.render('about')
})


router.get('/sps', (req, res) => {
    res.render('sps')
})

router.get('/invoice', (req, res) => {
    res.render('invoice')
})
router.get('/tat', (req, res) => {
    res.render('tat')
})

router.get('/visit', async(req, res) => {
    const data = await prisma.users.findMany({
        orderBy:{created_at:'desc'},
        select:{
            name:true
        }
    })

    const usernames =  data.map((user)=>user.name)
    usernames.unshift("----------------------------------Select---------------------------------")
    res.render('visit',{
        usernames:usernames,
        isError:false,
        message:""

    })
})

router.get('/contact', async(req, res) => {
    const dataArray = [
        { name: 'John Doe', age: 30, city: 'New York' },
        { name: 'Jane Doe', age: 25, city: 'London' },
        { name: 'Bob Smith', age: 40, city: 'Paris' },
      ];
    
      await generateExcelAndSendResponse(dataArray, res);
    // res.render('contact',{
    //     isError: false,
    //     message: ""
    // })
})

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

router.get('/forgot-password', (req, res) => {
    res.render('forgotPassword', {
        isError: false,
        message: ""
    })
})

router.get('/reset-password/:token',(req,res)=>{
    let hash = req.params.token
    res.render('resetPassword',{
        hash:hash
    })
})
async function generateExcelAndSendResponse(dataArray, res) {
    try {
      // Create a new workbook and add a worksheet
      const workbook = new excel.Workbook();
      const worksheet = workbook.addWorksheet('Sheet 1');
  
      const columns = Object.keys(dataArray[0]);
    worksheet.columns = columns.map(column => ({
      header: column,
      key: column,
      width: 15,
    }));

    // Add data to the worksheet
    dataArray.forEach(data => {
      const row = worksheet.addRow(data);

      // Check if the row is empty (no data)
      const isEmptyRow = Object.values(data).every(value => value === undefined || value === null || value === '');

      // Add borders only if the row is not empty
      if (!isEmptyRow) {
        row.eachCell(cell => {
          cell.style = {
            border: {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' },
            },
          };
        });
      }
    });

  
      // Set content type and disposition including desired filename
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=example.xlsx');
  
      // Send the workbook as a buffer to the response
      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.error(error);
      res.status(500).send('Error generating Excel file');
    }
  }
  

module.exports = router