import express from 'express';
const app = express();
const PORT = process.env.PORT || 3000;
import expressLayouts from 'express-ejs-layouts';
import load,{ loadAll, getAllCompanies } from './scripts/loadYaml.js';


app.set('view engine', 'ejs');
app.set('views', './views');
app.use(expressLayouts);
app.set('layout', 'layout/base');

app.locals.title = 'Interview Problems';
app.locals.companiesNames = getAllCompanies(); 
app.locals.questions = loadAll();

app.get('/', (req, res) => {
    res.render('index');
});
app.get('/problem/:id', (req, res) => {
  const id = req.params.id;
  const problem = app.locals.questions.find(p => p.id === id);
  if (problem) {
    res.render('problem', { problem });
  } else {
    res.status(404).send('Problem not found');
  }
});

app.get('/companies', (req, res) => {
  res.render('companies');
});
app.get('/company-view/:company', (req,res) =>{
  const company = req.params.company;
  app.locals.questions = load(company);
  let question=load(company);
  res.render('companyView', {problemsByCompany: (question)});
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});