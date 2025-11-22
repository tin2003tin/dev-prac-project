const express = require('express')
const dotenv = require('dotenv')
const connectDB = require('./config/db')
const cors = require('cors') // <-- import cors

dotenv.config({ path: 'config/config.env' })

const authRoutes = require('./routes/auth')
const usersRoutes = require('./routes/users')
const bookingsRoutes = require('./routes/bookings')
const carsRoutes = require('./routes/cars')
const reviewsRoutes = require('./routes/reviews')

const app = express()

connectDB()

app.use(express.json())

app.use(
    cors({
        origin: 'http://localhost:3000', // your frontend URL
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true, // allow cookies if needed
    })
)

const apiRouter = express.Router()

apiRouter.use('/auth', authRoutes)
apiRouter.use('/users', usersRoutes)
apiRouter.use('/bookings', bookingsRoutes)
apiRouter.use('/cars', carsRoutes)
apiRouter.use('/reviews', reviewsRoutes)

app.use('/api/v1', apiRouter)

app.get('/', (req, res) => {
    res.send('Rental Car Booking API is running')
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
})
