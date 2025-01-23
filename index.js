const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
let mongoose = require('mongoose')

app.use(express.urlencoded({ extended: false }))
app.use(express.json())


mongoose.connect(process.env.MONGO_URI)
app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

const userInfo = new mongoose.Schema({
  username: String,
  description: String,
  duration: Number,
  date: String,
  id: String
});

const User = mongoose.model('User', userInfo);

app.post('/api/users', async (req, res) => {
  const name = req.body.username;
  const user = new User({
    username: name
  });
  await user.save();
  res.json({ username: user.username, _id: user._id });
});

app.get('/api/users', async(req, res) => {
  const info = await User.find({}).select({ username: 1, _id: 1 });
  if(info) res.json(info);
  else res.json({ error: 'No users found' });
})

app.post('/api/users/:_id/exercises', async (req, res) => {
  const id = req.params._id;
  const description = req.body.description;
  const duration = parseInt(req.body.duration);
  let date;
  if(!req.body.date){
    date = new Date().toDateString();
  }
  else{
    
    let now = new Date(req.body.date);
    if(isNaN(now) || now.toString() === 'Invalid Date') date = "Thu Jan 01 1970";
    else{
        
      const utcDayOfWeek = now.getUTCDay();
      const utcMonth = now.getUTCMonth();
      const utcDate = now.getUTCDate();
      const utcFullYear = now.getUTCFullYear();

      const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

      date = `${daysOfWeek[utcDayOfWeek]} ${months[utcMonth]} ${utcDate} ${utcFullYear}`;
    }
  }
  const user = await User.findOne({_id: id});
  if(!user) return res.json({ error: 'No user found' });
  const exercise = new User({
    username: user.username,
    description: description,
    duration: duration,
    date: date,
    id: id
  });
  await exercise.save();
  res.json({_id: id, username: user.username, date: date, duration: duration, description: description});
})

app.get('/api/users/:_id/logs', async (req, res) => {
  const id = req.params._id;
  const from = new Date(req.query.from);
  const to = new Date(req.query.to);
  const limit = parseInt(req.query.limit);
  let count = 0;
  let info = await User.find({id: id}).select({description: 1, duration: 1, date: 1});
  if(!info) return res.json({ error: 'No user found' });
  let obj = {
    _id: id,
    username: info.username,
    count: info.length,
    log: []
  };
  for(let i = 0; i < info.length; i++) {
    const now = new Date(info[i].date);
    if(req.query.from){
      if(now < from) continue;
    }
    if(req.query.to){
      if(now > to) continue;
    }
    obj.log[count] = {
      description: info[i].description,
      duration: parseInt(info[i].duration),
      date: info[i].date
    };
    count++;
    if(req.query.limit){
      if(count >= limit) break;
    }
  }
  obj.count = count;
  res.json(obj);
})


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
