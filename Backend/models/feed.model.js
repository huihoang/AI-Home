import mongoose  from "mongoose";


const feedDataSchema =  new mongoose.Schema({
    id:{
        type: String,
        required: true,
        unique: true
    },
    value: {
        type: mongoose.Schema.Types.Mixed,  
        required: true,
    },
    feed_id: {
        type: String,
        required: true,
    },
    feed_key: {
        type: String,
        required: true,
    },
    created_epoch: {
        type: Number,
        required: true
    },
    expiration: {
        type: Date, 
        required: true,
    },
    create_at: {
        type: Date,
        required: true,
    },
    sensor_id: {
        type: mongoose.Schema.ObjectId,
        ref: 'Sensor'
    }
},{
    timestamps: true
})

const feedData = mongoose.model('FeedData',feedDataSchema)

export default feedData