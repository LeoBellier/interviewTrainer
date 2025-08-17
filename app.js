import express from 'express';
const app = express();
const PORT = process.env.PORT || 3000;
let exercisesListNames = 'Interview Problems';
import expressLayouts from 'express-ejs-layouts';
import load from './scripts/loadYaml.js';


app.set('view engine', 'ejs');
app.set('views', './views');
app.use(expressLayouts);
app.set('layout', 'layout/base');

const search = (req, res, next) => {
  const searchText = req.query.search || '';
}

app.locals.problems = load(); // Load problems from YAML file
app.locals.title = 'Interview Problems';
app.locals.companiesNames = app.locals.problems.flatMap(problem => problem.companies).filter((value, index, self) => self.indexOf(value) === index); // Unique company names 

app.get('/', (req, res) => {
    res.render('index');
});
app.get('/problem/:id', (req, res) => {
  const problemId = parseInt(req.params.id, 10);
  const problem = app.locals.problems.find(p => p.id === problemId);
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
  res.render('companyView', {problemsByCompany: app.locals.problems.filter(p => p.companies.includes(company))});
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});