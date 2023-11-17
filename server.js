const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const csv = require('csv-parser');
const fs = require('fs');

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
const csvWriter = createCsvWriter({
  path: 'responses.csv',
  header: [
    { id: 'fruit', title: 'Fruit' },
  ],
  append: true,
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/submit', (req, res) => {
  const formData = req.body;
  console.log('Received form data:', formData);
  // Save form data to a CSV file (responses.csv)
  csvWriter.writeRecords([formData])
    .then(() => {
      console.log('Form data saved to CSV file:', formData);
      res.send('Form submitted successfully!');
    })
    .catch((err) => {
      console.error('Error writing to CSV file:', err);
      res.status(500).send('Internal Server Error');
    });
});


app.get('/getCSVData', (req, res) => {
    const data = [];
  
    // Read data from CSV file
    fs.createReadStream('responses.csv')
      .pipe(csv())
      .on('data', (row) => {
        // Process each row of data
        data.push(row);
      })
      .on('end', () => {
        // Count occurrences of each unique fruit
        const countData = countOccurrences(data, 'fruit'); // Replace 'fruit' with the property you want to count
  
        // Send the count data as JSON response
        res.json(countData);
      })
      .on('error', (error) => {
        console.error('Error reading CSV file:', error);
        res.status(500).send('Internal Server Error');
      });
  });
  
  // Function to count occurrences of each unique value in a property
  function countOccurrences(array, property) {
    const countObject = {};
  
    array.forEach(obj => {
      const value = obj[property];
  
      if (value) {
        countObject[value] = (countObject[value] || 0) + 1;
      }
    });
  
    return countObject;
  }
  
  

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
