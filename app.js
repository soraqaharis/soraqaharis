const express = require('express');
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
require('dotenv').config();
const app = express()
app.use(cookieParser())


const port = 5000;
app.use(cors())
app.use(express.json())
const Video = require('./models/video.model');
const User = require('./models/user.model')
const { default: mongoose } = require('mongoose');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const allowedOrigins = ['http://localhost:3000']; // Add your frontend URL
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));


mongoose.connect('mongodb+srv://soraqaharis10in7:LpSH9r4r6prtroWx@cluster0.uqhbk50.mongodb.net/add', {
    useNewUrlParser: true, useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('Failed to connect to MongoDB', err));






app.post('/addtodo', async (req, res)=>{
    
    const {title, description, media} = req.body;
    
    if(!title || !description || !media){
        return res.status(422).json({massage: 'please fill'})
    }
     try {
        const existFile = await Video.findOne({media})
        if(existFile){
            return res.status(422).json({message: 'File already exist'})
        }
            const newFile = new Video({title, description, media})
            await newFile.save()
            res.status(201).json({massage: 'File uploaded'})
        
        
     } catch (error) {
        res.status(500).json({
            massage: 'server error'
        })
     }
})

app.post('/registers', async (req, res)=>{
    const {name, email, username, password} = req.body;
    if (!name || !email || !username || !password) {
        return res.status(422).json({ message: 'Please fill all fields' });
      }
    try {
      const user = await User.findOne({email})
      if(user){
        return res.status(422).json({message:'User already registered'})

      }
      const hashP = await bcrypt.hash(password, 10)
      const newUser = new User({name, email, username, password:hashP})
      await newUser.save()
      res.status(200).json({message: 'User Register successfully'})

    } catch (error) {
        res.status(500).json({message:'something wrong in registeration'})
    }
})

app.post('/loginn', async (req, res)=>{

  try {
    const {email, password} = req.body;
  if(!email || !password){
      return res.status(422).json({message: 'fill al input'})
  }
  
  const user = await User.findOne({email});
  if(!user){
      res.status(422).json({message: 'User not register'})
  }
  const matchP = await bcrypt.compare(password, user.password);
  if(!matchP){
      res.status(422).json({message:'email or password are invalid'})
  }
  
  const token = await jwt.sign({_id: user._id}, process.env.SECRET_KEY)
  res.cookie('token', token, {
      maxAge: 3600000,
      httpOnly: true
  })
  res.status(200).json({ message: 'Login successful' });

  } catch (error) {
    res.status(500).json({message:'login error'})
  }
  

})

app.get('/verifyuser', async (req, res) => {
    const token = req.cookies.token;
    if (!token) {
      return res.status(422).json({ message: 'Token not found' });
    }
    try {
      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      const user = await User.findById(decoded._id);
      if (!user) {
        return res.status(422).json({ message: 'User not verified' });
      }
      res.status(200).json({ message: 'User verified', user }); // Added response when user is verified
    } catch (error) {
      res.status(500).json({ message: 'Token error', error });
    }
  });
  

app.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ message: 'Logout successful' });
});

app.get('/todoss', async (req, res)=>{
    console.log('GET / ///request received');
    try {
        const todo = await Video.find();
        res.status(200).json(todo)
    } catch (error) {
        res.status(500).json({ message: 'Error fetching todos', error });
    }
});



app.listen(port, ()=>{
    console.log(`I am listening from at port no ${port}`)
})