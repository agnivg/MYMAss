const url = 'https://api.nasa.gov/planetary/apod?count=1&api_key='
const api_key = 'PZWJCFe9xgTBU4Hij8Q4CvNUbRSEPTVjsi1Hhpkl'

const fetchNASAData = async () => {
  try {
    const response = await fetch(`${url}${api_key}`)
    const data = await response.json()
    console.log('NASA APOD data', data)
    displayData(data[0])
  } catch (error) {
    console.log(error)
  }
}

const displayData = (data) => {
  document.getElementById('title').textContent = data.title
  document.getElementById('date').textContent = data.date
  document.getElementById('picture').src = data.hdurl  
  document.getElementById('explanation').textContent = data.explanation
}

fetchNASAData()