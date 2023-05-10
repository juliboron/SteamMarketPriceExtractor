var https = require('https');
const fs = require('fs');

const {STEAMAPIS_API_KEY, cookie} = require('./SECRETS')

var url = "https://steamcommunity.com/market/pricehistory/?appid=730&market_hash_name=P90%20%7C%20Blind%20Spot%20(Field-Tested)";

var listItemNames;

// const ItemsOptions = {
//     headers: {
//       'Cookie': ""
//     }
//   };

// const options = {
//     headers: {
//       'Cookie': cookie
//     }
//   };

  getPriceHistoryByMarketName(url, "Test")
  //getAllMarketNames()

  //getAllPriceCSVs();

  
  function getPriceHistoryByMarketName(url, name){
    https.get(url, {headers: {'Cookie': cookie}}, (response) => {
        let data = '';
      
        response.on('data', (chunk) => {
          data += chunk;
        });
      
        response.on('end', () => {
          if (data) {
            try {
              const jsonData = JSON.parse(data);
              //console.log(jsonData['prices']);
              console.log(makeFilename(name))
              const date = new Date();
              const formattedDate = date.toISOString().slice(0, 10).replace(/-/g, '_');

              var priceHistory = jsonData['prices'];
              var csv = priceHistory.map(row => {
                const date = row[0].split(' ')[1] + '_' + row[0].split(' ')[2] + '_' + row[0].split(' ')[3].split(':')[0];
                console.log("Element 1: " + row[0].split(' ')[0] + ' Element 2: ' + row[0].split(' ')[1] + ' Element 3: '+ row[0].split(' ')[2] + "   " + row[0].split(' ')[3].split(':')[0]);
                const timestamp = new Date(row[0].split(' ')[2], numMonth(row[0].split(' ')[0]), row[0].split(' ')[1], row[0].split(' ')[3].split(':')[0]).getTime();
                return `${timestamp},${row[1]},${row[2]}`;                
              }).join('\n');

    
              fs.writeFileSync(`${makeFilename(name)}${formattedDate}.csv`, csv);
    
            } catch (error) {
              console.error('Error parsing JSON:', error);
            }
          } else {
            console.error('Empty response received');
          }
        });
      });
  }

  function getAllMarketNames(){
    https.get(`https://api.steamapis.com/market/items/730?api_key=${STEAMAPIS_API_KEY}`, {headers: {'Cookie': ""}}, (response) => {
    let data = '';
  
    response.on('data', (chunk) => {
      data += chunk;
    });
  
    response.on('end', () => {
      if (data) {
        try {
          const jsonData = JSON.parse(data);

          ItemsData = jsonData['data'];
     

          const marketNames = ItemsData.map(item => item.market_name)
          
          console.log(marketNames)
          listItemNames = marketNames;

        } catch (error) {
          console.error('Error parsing JSON:', error);
        }
      } else {
        console.error('Empty response received');
      }
    });
  });
  }



  function getAllPriceCSVs(){
    https.get(`https://api.steamapis.com/market/items/730?api_key=${STEAMAPIS_API_KEY}`, {headers: {'Cookie': ""}}, (response) => {
    let data = '';
  
    response.on('data', (chunk) => {
      data += chunk;
    });
  
    response.on('end', () => {
      if (data) {
        try {
          const jsonData = JSON.parse(data);

          ItemsData = jsonData['data'];
     

          const marketNames = ItemsData.map(item => item.market_name)
          
          console.log(typeof marketNames)
          listItemNames = marketNames;
          
          
          marketNames.forEach(marketName => {
            const marketHashName = getHashFromName(marketName);
            getPriceHistoryByMarketName(`https://steamcommunity.com/market/pricehistory/?appid=730&market_hash_name=${marketHashName}`, marketName);
          });
        

        } catch (error) {
          console.error('Error parsing JSON:', error);
        }
      } else {
        console.error('Empty response received');
      }
    });
  });
  }
  
  function getNameFromHash(name){
    let text = name.replace(/%20/g, ' ');
    text = text.replace(/%7C/g, '|');
    return text;
  }

  function getHashFromName(name){
    let text = name.replace(/ /g, "%20");
    text = text.replace(/\|/g, "%7C");
    return text;
  }

  function makeFilename(name) {
    getHashFromName(name);
    let text = name.replace(/%20/g, ' ');
    text = text.replace(/%7C/g, ' ');
    text = text.replace(/\|/g, " ");
    text = text.replace(/\|/g, " ");
    return text;
  }

  function numMonth(monthAbbr) {
    return (String(['Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec'].indexOf(monthAbbr) + 1).padStart(2, '0'))
  }