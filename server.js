const express=require ('express'); //need it bc it's an app
const mongoose=require ('mongoose'); //db
const bodyParser=require ('body-parser');
const path= require ('path');

var app=express ();
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));//middleware used to understand the requests

mongoose.connect('mongodb://localhost/mongoose_dashboard'); //mongoose_dashboard is the db
var MongooseSchema= new mongoose.Schema({ //use new to create an instance--> schema is like a model or table--it's like a blueprint
    name: {type: String, minlength: [3, "Name must be 3 or more characters"]},
    age: {type: Number, min: [2, 'Mongoose must be 2 or older'], required: [true, 'put the age']},
}); 

//to forward engineer or migrate: 
var Mongoose=mongoose.model('Mongoose', MongooseSchema);//grab this guy --model the 'Mongoose' based on the MongooseSchema and save it as a usable variable Mongoose////creating tables//same format if another schema (two steps in one line)

app.get('/', (req, res)=>{
    
    Mongoose.find({}, (err, mongooses)=>{ //expect some error or data might come back
        if (err){
        console.log("error", err);
        }else{
        //console.log('error', err);
        //console.log(mongooses);
        res.render("index", { allMongooses: mongooses });// it was at the bottom, but it was moved up here bc if placed at the bottom this line will run before the middle one bc of asynchronnus callbacks if you want res render when something good happens//all mongooses as key in index.ejs
        }
    });
});

app.get('/mongooses/new', (req, res)=>{
    res.render('add')
})

app.post('/mongooses', (req, res)=>{
    Mongoose.create(req.body, (err, data)=>{ //using the variable above that is the model--rec.body is the data we're adding in
    
        if (err){
            for(var e in err.errors){
                console.log(err.errors[e].message);
                req.flash('myerror', err.errors[e].message)
            }
        }else{
            console.log('success', data);
        }
        res.redirect('/')
    });
    //console.log("got it");
    //console.log(req.body); //accesses the form data
    
})

app.post('/mongooses/destroy/:id', (req, res)=>{
    Mongoose.remove({_id: req.params.id}, (err, data)=>{
        if (err){
            console.log(err);
        }else{
            console.log('success', data);
        }
    });
    //console.log(req.params.id);
    res.redirect('/')
});

app.get('/mongooses/edit/:id', (req, res)=>{
    Mongoose.findById({_id: req.params.id}, (err, goose)=>{
        if (err) {
            console.log(err);
            res.redirect ('/');
        } else {
            console.log('success', goose);
            res.render('edit', {goose: goose}); //the first goose was from the parameter and second is like jinja
        }
    
    })
})//////shows the edit page

app.post('/mongooses/:id', (req, res)=>{
    Mongoose.update({_id: req.params.id}, req.body, (err, data)=>{
      if (err){
          console.log('error when editing', err);
          res.redirect(`/mongooses/edit/${req.params.id}`)

      }else{
          console.log('we did it', data);
          res.redirect('/');
      }
    })
}) ///////processes the edit info

app.get('/mongooses/:id', (req, res)=>{
    Mongoose.findById({_id: req.params.id}, (err, goose)=>{ //err, goose is a callback
        if (err){
            console.log(err);
            res.redirect('/');
        
        }else{
            console.log(goose);
            res.render('single', {goose: goose})
        }
    })
})


app.listen(8000, ()=>{
    console.log("On 8000")
})