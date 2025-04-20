import mongoose from 'mongoose'

const userConfigSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },
    thresholds: {
        temperature: {
            high: {
                type: Number,
                default: 37
            },
            low: {
                type:Number,
                default: 18
            }
        },
        humidity: {
            high: {
                type:Number,
                default: 70
            },
            low: {
                type:Number,
                default: 30
            }
        },
        brightness: {
            high:{
                type: Number,
                default:80
            },
            low: {
                type: Number,
                default:20
            }
        }
    },
    automation: {
        enable: {type: Boolean, default: false},
        rules: [{
            condition: {
                sensor: {type: String, enum: ['temperature','humidity','brightness','motion']},
                operator: {type: String, enum: ['<','>','=','<=','>=']},
                value: Number
            },
            action: {
                feedId: String,
                status: String
            }
        }]
    },
    notification: {
        email: {type: Boolean, default: false},
        push: { type: Boolean, default: true}
    },
    schedules: [{
        device: String,  //feedID
        status: String,  // ON/OFF  or 0/1
        time: String,  // "HH:MM"
        days: [Number],  
        enable: Boolean
    }]
},{timestamps: true});

const UserConfig = mongoose.model('UserConfig', userConfigSchema);
export default UserConfig;