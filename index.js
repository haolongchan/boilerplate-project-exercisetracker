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
  const duration = req.body.duration;
  const dateNumber = req.body.date;
  const date = (new Date(dateNumber.substr(0, 4) + '-' + dateNumber.substr(4, 2) + '-' + dateNumber.substr(6))).toDateString();
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


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
