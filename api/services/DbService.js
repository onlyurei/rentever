var util = require('util');

var listings = [
    {
        title: 'kayak in Chicago kayak in Chicago kayak in Chicago 2',
        coords: [-87.6500500, 41.8500300],
        dailyPrice: 15,
        short: 'red kayak in Chicago red kayak in Chicago red kayak in Chicago',
        city: 'Chicago',
        imageUrl: 'http://media.phuketgazette.net/images/articles/2014/4_201453151126320_wRLCSEhFcnujmsXjgRrJsUgTerFjpKXiUoXkbjmU_jpeg.jpeg',
        imageUrl2: 'http://nextadventure.net/images/detailed/5/Dagger-Axis-10.5-Kayak-with-Skeg.jpg'
    },
    {
        title: 'kayak in Skokie',
        coords: [-87.754961, 42.027764],
        dailyPrice: 13,
        short: 'blue kayak in Skokie',
        city: 'Skokie',
        imageUrl: 'http://awesomobile.com/wp-content/uploads/2012/05/transparent-canoe-kayak-1.jpg'
    },
    {
        title: 'kayak in Oakpark',
        coords: [-87.784149, 41.885001],
        dailyPrice: 12,
        short: 'yellow kayak in Oakpark',
        city: 'Oakpark'
    },
    {
        title: 'kayak in Cicero',
        coords: [-87.754000, 41.843597],
        dailyPrice: 11,
        short: 'purple kayak in Cicero',
        city: 'Cicero',
        imageUrl: 'http://eofdreams.com/data_images/dreams/kayak/kayak-09.jpg',
        imageUrl2: 'http://nextadventure.net/images/detailed/5/Dagger-Axis-10.5-Kayak-with-Skeg.jpg'
    },
    {
        title: 'kayak in Edgewater',
        coords: [-87.661160, 41.987093],
        dailyPrice: 14,
        short: 'green kayak in Edgewater',
        city: 'Edgewater',
        imageUrl: 'http://img.grouponcdn.com/deal/eD33zWPLThJTUk8dsBkc/Nc-700x420/v1/c700x420.jpg',
        imageUrl2: 'http://nextadventure.net/images/detailed/5/Dagger-Axis-10.5-Kayak-with-Skeg.jpg'
    },
    {
        title: 'kayak in Naperville',
        coords: [-88.144202, 41.776833],
        dailyPrice: 10,
        short: 'black kayak in Naperville',
        city: 'Naperville',
        imageUrl: 'http://bestfishingkayakfocus.com/wp-content/uploads/2013/12/ocea-kayak-summer-colors-wallpapers-1024x768.jpg',
        imageUrl2: 'http://nextadventure.net/images/detailed/5/Dagger-Axis-10.5-Kayak-with-Skeg.jpg'
    },
    {
        title: 'kayak in Ottawa Illinois',
        coords: [-88.842378, 41.345543],
        dailyPrice: 5,
        short: 'white kayak in Ottawa Illinois',
        city: 'Ottawa',
        imageUrl: 'http://cdn.allsedona.com/images/content/21039_16996_Sedona_Arizona_Kayaking_md.jpg',
        imageUrl2: 'http://nextadventure.net/images/detailed/5/Dagger-Axis-10.5-Kayak-with-Skeg.jpg'
    },
    {
        title: 'bike in Indianapolis',
        coords: [-86.1580400, 39.7683800],
        dailyPrice: 10,
        short: 'mountain bike in Indianapolis',
        city: 'Indianapolis',
        imageUrl: 'http://2k13.konaworld.com/images/bikes/hires/lanai.jpg',
        imageUrl2: 'http://www.dexigner.com/news/image/22948/Thonet_Concept_Bike_04'
    },
    {
        title: 'kayak in Chicago kayak in Chicago kayak in Chicago kayak in Chicago kayak in Chicago',
        coords: [-87.6500500, 41.8500300],
        dailyPrice: 15,
        short: 'red kayak in Chicago red kayak in Chicago red kayak in Chicago',
        city: 'Chicago',
        imageUrl: 'http://media.phuketgazette.net/images/articles/2014/4_201453151126320_wRLCSEhFcnujmsXjgRrJsUgTerFjpKXiUoXkbjmU_jpeg.jpeg',
        imageUrl2: 'http://nextadventure.net/images/detailed/5/Dagger-Axis-10.5-Kayak-with-Skeg.jpg'
    },
    {
        title: 'kayak in Skokie',
        coords: [-87.754961, 42.027764],
        dailyPrice: 13,
        short: 'blue kayak in Skokie',
        city: 'Skokie',
        imageUrl: 'http://awesomobile.com/wp-content/uploads/2012/05/transparent-canoe-kayak-1.jpg'
    },
    {
        title: 'kayak in Oakpark',
        coords: [-87.784149, 41.885001],
        dailyPrice: 12,
        short: 'yellow kayak in Oakpark',
        city: 'Oakpark'
    },
    {
        title: 'kayak in Cicero',
        coords: [-87.754000, 41.843597],
        dailyPrice: 11,
        short: 'purple kayak in Cicero',
        city: 'Cicero',
        imageUrl: 'http://eofdreams.com/data_images/dreams/kayak/kayak-09.jpg',
        imageUrl2: 'http://nextadventure.net/images/detailed/5/Dagger-Axis-10.5-Kayak-with-Skeg.jpg'
    },
    {
        title: 'kayak in Edgewater',
        coords: [-87.661160, 41.987093],
        dailyPrice: 14,
        short: 'green kayak in Edgewater',
        city: 'Edgewater',
        imageUrl: 'http://img.grouponcdn.com/deal/eD33zWPLThJTUk8dsBkc/Nc-700x420/v1/c700x420.jpg',
        imageUrl2: 'http://nextadventure.net/images/detailed/5/Dagger-Axis-10.5-Kayak-with-Skeg.jpg'
    },
    {
        title: 'kayak in Naperville',
        coords: [-88.144202, 41.776833],
        dailyPrice: 10,
        short: 'black kayak in Naperville',
        city: 'Naperville',
        imageUrl: 'http://bestfishingkayakfocus.com/wp-content/uploads/2013/12/ocea-kayak-summer-colors-wallpapers-1024x768.jpg',
        imageUrl2: 'http://nextadventure.net/images/detailed/5/Dagger-Axis-10.5-Kayak-with-Skeg.jpg'
    },
    {
        title: 'kayak in Ottawa Illinois',
        coords: [-88.842378, 41.345543],
        dailyPrice: 5,
        short: 'white kayak in Ottawa Illinois',
        city: 'Ottawa',
        imageUrl: 'http://cdn.allsedona.com/images/content/21039_16996_Sedona_Arizona_Kayaking_md.jpg',
        imageUrl2: 'http://nextadventure.net/images/detailed/5/Dagger-Axis-10.5-Kayak-with-Skeg.jpg'
    },
    {
        title: 'bike in Indianapolis',
        coords: [-86.1580400, 39.7683800],
        dailyPrice: 10,
        short: 'mountain bike in Indianapolis',
        city: 'Indianapolis',
        imageUrl: 'http://2k13.konaworld.com/images/bikes/hires/lanai.jpg',
        imageUrl2: 'http://www.dexigner.com/news/image/22948/Thonet_Concept_Bike_04'
    },
    {
        title: 'kayak in Chicago kayak in Chicago kayak in Chicago kayak in Chicago kayak in Chicago',
        coords: [-87.6500500, 41.8500300],
        dailyPrice: 15,
        short: 'red kayak in Chicago red kayak in Chicago red kayak in Chicago',
        city: 'Chicago',
        imageUrl: 'http://media.phuketgazette.net/images/articles/2014/4_201453151126320_wRLCSEhFcnujmsXjgRrJsUgTerFjpKXiUoXkbjmU_jpeg.jpeg',
        imageUrl2: 'http://nextadventure.net/images/detailed/5/Dagger-Axis-10.5-Kayak-with-Skeg.jpg'
    },
    {
        title: 'kayak in Skokie',
        coords: [-87.754961, 42.027764],
        dailyPrice: 13,
        short: 'blue kayak in Skokie',
        city: 'Skokie',
        imageUrl: 'http://awesomobile.com/wp-content/uploads/2012/05/transparent-canoe-kayak-1.jpg'
    },
    {
        title: 'kayak in Oakpark',
        coords: [-87.784149, 41.885001],
        dailyPrice: 12,
        short: 'yellow kayak in Oakpark',
        city: 'Oakpark'
    },
    {
        title: 'kayak in Cicero',
        coords: [-87.754000, 41.843597],
        dailyPrice: 11,
        short: 'purple kayak in Cicero',
        city: 'Cicero',
        imageUrl: 'http://eofdreams.com/data_images/dreams/kayak/kayak-09.jpg',
        imageUrl2: 'http://nextadventure.net/images/detailed/5/Dagger-Axis-10.5-Kayak-with-Skeg.jpg'
    },
    {
        title: 'kayak in Edgewater',
        coords: [-87.661160, 41.987093],
        dailyPrice: 14,
        short: 'green kayak in Edgewater',
        city: 'Edgewater',
        imageUrl: 'http://img.grouponcdn.com/deal/eD33zWPLThJTUk8dsBkc/Nc-700x420/v1/c700x420.jpg',
        imageUrl2: 'http://nextadventure.net/images/detailed/5/Dagger-Axis-10.5-Kayak-with-Skeg.jpg'
    },
    {
        title: 'kayak in Naperville',
        coords: [-88.144202, 41.776833],
        dailyPrice: 10,
        short: 'black kayak in Naperville',
        city: 'Naperville',
        imageUrl: 'http://bestfishingkayakfocus.com/wp-content/uploads/2013/12/ocea-kayak-summer-colors-wallpapers-1024x768.jpg',
        imageUrl2: 'http://nextadventure.net/images/detailed/5/Dagger-Axis-10.5-Kayak-with-Skeg.jpg'
    },
    {
        title: 'kayak in Ottawa Illinois',
        coords: [-88.842378, 41.345543],
        dailyPrice: 5,
        short: 'white kayak in Ottawa Illinois',
        city: 'Ottawa',
        imageUrl: 'http://cdn.allsedona.com/images/content/21039_16996_Sedona_Arizona_Kayaking_md.jpg',
        imageUrl2: 'http://nextadventure.net/images/detailed/5/Dagger-Axis-10.5-Kayak-with-Skeg.jpg'
    },
    {
        title: 'bike in Indianapolis',
        coords: [-86.1580400, 39.7683800],
        dailyPrice: 10,
        short: 'mountain bike in Indianapolis',
        city: 'Indianapolis',
        imageUrl: 'http://2k13.konaworld.com/images/bikes/hires/lanai.jpg',
        imageUrl2: 'http://www.dexigner.com/news/image/22948/Thonet_Concept_Bike_04'
    },
    {
        title: 'kayak in Chicago kayak in Chicago kayak in Chicago kayak in Chicago kayak in Chicago',
        coords: [-87.6500500, 41.8500300],
        dailyPrice: 15,
        short: 'red kayak in Chicago red kayak in Chicago red kayak in Chicago',
        city: 'Chicago',
        imageUrl: 'http://media.phuketgazette.net/images/articles/2014/4_201453151126320_wRLCSEhFcnujmsXjgRrJsUgTerFjpKXiUoXkbjmU_jpeg.jpeg',
        imageUrl2: 'http://nextadventure.net/images/detailed/5/Dagger-Axis-10.5-Kayak-with-Skeg.jpg'
    },
    {
        title: 'kayak in Skokie',
        coords: [-87.754961, 42.027764],
        dailyPrice: 13,
        short: 'blue kayak in Skokie',
        city: 'Skokie',
        imageUrl: 'http://awesomobile.com/wp-content/uploads/2012/05/transparent-canoe-kayak-1.jpg'
    },
    {
        title: 'kayak in Oakpark',
        coords: [-87.784149, 41.885001],
        dailyPrice: 12,
        short: 'yellow kayak in Oakpark',
        city: 'Oakpark'
    },
    {
        title: 'kayak in Cicero',
        coords: [-87.754000, 41.843597],
        dailyPrice: 11,
        short: 'purple kayak in Cicero',
        city: 'Cicero',
        imageUrl: 'http://eofdreams.com/data_images/dreams/kayak/kayak-09.jpg',
        imageUrl2: 'http://nextadventure.net/images/detailed/5/Dagger-Axis-10.5-Kayak-with-Skeg.jpg'
    },
    {
        title: 'kayak in Edgewater',
        coords: [-87.661160, 41.987093],
        dailyPrice: 14,
        short: 'green kayak in Edgewater',
        city: 'Edgewater',
        imageUrl: 'http://img.grouponcdn.com/deal/eD33zWPLThJTUk8dsBkc/Nc-700x420/v1/c700x420.jpg',
        imageUrl2: 'http://nextadventure.net/images/detailed/5/Dagger-Axis-10.5-Kayak-with-Skeg.jpg'
    },
    {
        title: 'kayak in Naperville',
        coords: [-88.144202, 41.776833],
        dailyPrice: 10,
        short: 'black kayak in Naperville',
        city: 'Naperville',
        imageUrl: 'http://bestfishingkayakfocus.com/wp-content/uploads/2013/12/ocea-kayak-summer-colors-wallpapers-1024x768.jpg',
        imageUrl2: 'http://nextadventure.net/images/detailed/5/Dagger-Axis-10.5-Kayak-with-Skeg.jpg'
    },
    {
        title: 'kayak in Ottawa Illinois',
        coords: [-88.842378, 41.345543],
        dailyPrice: 5,
        short: 'white kayak in Ottawa Illinois',
        city: 'Ottawa',
        imageUrl: 'http://cdn.allsedona.com/images/content/21039_16996_Sedona_Arizona_Kayaking_md.jpg',
        imageUrl2: 'http://nextadventure.net/images/detailed/5/Dagger-Axis-10.5-Kayak-with-Skeg.jpg'
    },
    {
        title: 'bike in Indianapolis',
        coords: [-86.1580400, 39.7683800],
        dailyPrice: 10,
        short: 'mountain bike in Indianapolis',
        city: 'Indianapolis',
        imageUrl: 'http://2k13.konaworld.com/images/bikes/hires/lanai.jpg',
        imageUrl2: 'http://www.dexigner.com/news/image/22948/Thonet_Concept_Bike_04'
    },
    {
        title: 'kayak in Chicago kayak in Chicago kayak in Chicago kayak in Chicago kayak in Chicago',
        coords: [-87.6500500, 41.8500300],
        dailyPrice: 15,
        short: 'red kayak in Chicago red kayak in Chicago red kayak in Chicago',
        city: 'Chicago',
        imageUrl: 'http://media.phuketgazette.net/images/articles/2014/4_201453151126320_wRLCSEhFcnujmsXjgRrJsUgTerFjpKXiUoXkbjmU_jpeg.jpeg',
        imageUrl2: 'http://nextadventure.net/images/detailed/5/Dagger-Axis-10.5-Kayak-with-Skeg.jpg'
    },
    {
        title: 'kayak in Skokie',
        coords: [-87.754961, 42.027764],
        dailyPrice: 13,
        short: 'blue kayak in Skokie',
        city: 'Skokie',
        imageUrl: 'http://awesomobile.com/wp-content/uploads/2012/05/transparent-canoe-kayak-1.jpg'
    },
    {
        title: 'kayak in Oakpark',
        coords: [-87.784149, 41.885001],
        dailyPrice: 12,
        short: 'yellow kayak in Oakpark',
        city: 'Oakpark'
    },
    {
        title: 'kayak in Cicero',
        coords: [-87.754000, 41.843597],
        dailyPrice: 11,
        short: 'purple kayak in Cicero',
        city: 'Cicero',
        imageUrl: 'http://eofdreams.com/data_images/dreams/kayak/kayak-09.jpg',
        imageUrl2: 'http://nextadventure.net/images/detailed/5/Dagger-Axis-10.5-Kayak-with-Skeg.jpg'
    },
    {
        title: 'kayak in Edgewater',
        coords: [-87.661160, 41.987093],
        dailyPrice: 14,
        short: 'green kayak in Edgewater',
        city: 'Edgewater',
        imageUrl: 'http://img.grouponcdn.com/deal/eD33zWPLThJTUk8dsBkc/Nc-700x420/v1/c700x420.jpg',
        imageUrl2: 'http://nextadventure.net/images/detailed/5/Dagger-Axis-10.5-Kayak-with-Skeg.jpg'
    },
    {
        title: 'kayak in Naperville',
        coords: [-88.144202, 41.776833],
        dailyPrice: 10,
        short: 'black kayak in Naperville',
        city: 'Naperville',
        imageUrl: 'http://bestfishingkayakfocus.com/wp-content/uploads/2013/12/ocea-kayak-summer-colors-wallpapers-1024x768.jpg',
        imageUrl2: 'http://nextadventure.net/images/detailed/5/Dagger-Axis-10.5-Kayak-with-Skeg.jpg'
    },
    {
        title: 'kayak in Ottawa Illinois',
        coords: [-88.842378, 41.345543],
        dailyPrice: 5,
        short: 'white kayak in Ottawa Illinois',
        city: 'Ottawa',
        imageUrl: 'http://cdn.allsedona.com/images/content/21039_16996_Sedona_Arizona_Kayaking_md.jpg',
        imageUrl2: 'http://nextadventure.net/images/detailed/5/Dagger-Axis-10.5-Kayak-with-Skeg.jpg'
    },
    {
        title: 'bike in Indianapolis',
        coords: [-86.1580400, 39.7683800],
        dailyPrice: 10,
        short: 'mountain bike in Indianapolis',
        city: 'Indianapolis',
        imageUrl: 'http://2k13.konaworld.com/images/bikes/hires/lanai.jpg',
        imageUrl2: 'http://www.dexigner.com/news/image/22948/Thonet_Concept_Bike_04'
    },
    {
        title: 'kayak in Chicago kayak in Chicago kayak in Chicago kayak in Chicago kayak in Chicago',
        coords: [-87.6500500, 41.8500300],
        dailyPrice: 15,
        short: 'red kayak in Chicago red kayak in Chicago red kayak in Chicago',
        city: 'Chicago',
        imageUrl: 'http://media.phuketgazette.net/images/articles/2014/4_201453151126320_wRLCSEhFcnujmsXjgRrJsUgTerFjpKXiUoXkbjmU_jpeg.jpeg',
        imageUrl2: 'http://nextadventure.net/images/detailed/5/Dagger-Axis-10.5-Kayak-with-Skeg.jpg'
    },
    {
        title: 'kayak in Skokie',
        coords: [-87.754961, 42.027764],
        dailyPrice: 13,
        short: 'blue kayak in Skokie',
        city: 'Skokie',
        imageUrl: 'http://awesomobile.com/wp-content/uploads/2012/05/transparent-canoe-kayak-1.jpg'
    },
    {
        title: 'kayak in Oakpark',
        coords: [-87.784149, 41.885001],
        dailyPrice: 12,
        short: 'yellow kayak in Oakpark',
        city: 'Oakpark'
    },
    {
        title: 'kayak in Cicero',
        coords: [-87.754000, 41.843597],
        dailyPrice: 11,
        short: 'purple kayak in Cicero',
        city: 'Cicero',
        imageUrl: 'http://eofdreams.com/data_images/dreams/kayak/kayak-09.jpg',
        imageUrl2: 'http://nextadventure.net/images/detailed/5/Dagger-Axis-10.5-Kayak-with-Skeg.jpg'
    },
    {
        title: 'kayak in Edgewater',
        coords: [-87.661160, 41.987093],
        dailyPrice: 14,
        short: 'green kayak in Edgewater',
        city: 'Edgewater',
        imageUrl: 'http://img.grouponcdn.com/deal/eD33zWPLThJTUk8dsBkc/Nc-700x420/v1/c700x420.jpg',
        imageUrl2: 'http://nextadventure.net/images/detailed/5/Dagger-Axis-10.5-Kayak-with-Skeg.jpg'
    },
    {
        title: 'kayak in Naperville',
        coords: [-88.144202, 41.776833],
        dailyPrice: 10,
        short: 'black kayak in Naperville',
        city: 'Naperville',
        imageUrl: 'http://bestfishingkayakfocus.com/wp-content/uploads/2013/12/ocea-kayak-summer-colors-wallpapers-1024x768.jpg',
        imageUrl2: 'http://nextadventure.net/images/detailed/5/Dagger-Axis-10.5-Kayak-with-Skeg.jpg'
    },
    {
        title: 'kayak in Ottawa Illinois',
        coords: [-88.842378, 41.345543],
        dailyPrice: 5,
        short: 'white kayak in Ottawa Illinois',
        city: 'Ottawa',
        imageUrl: 'http://cdn.allsedona.com/images/content/21039_16996_Sedona_Arizona_Kayaking_md.jpg',
        imageUrl2: 'http://nextadventure.net/images/detailed/5/Dagger-Axis-10.5-Kayak-with-Skeg.jpg'
    },
    {
        title: 'bike in Indianapolis',
        coords: [-86.1580400, 39.7683800],
        dailyPrice: 10,
        short: 'mountain bike in Indianapolis',
        city: 'Indianapolis',
        imageUrl: 'http://2k13.konaworld.com/images/bikes/hires/lanai.jpg',
        imageUrl2: 'http://www.dexigner.com/news/image/22948/Thonet_Concept_Bike_04'
    },
    {
        title: 'kayak in Chicago kayak in Chicago kayak in Chicago kayak in Chicago kayak in Chicago',
        coords: [-87.6500500, 41.8500300],
        dailyPrice: 15,
        short: 'red kayak in Chicago red kayak in Chicago red kayak in Chicago',
        city: 'Chicago',
        imageUrl: 'http://media.phuketgazette.net/images/articles/2014/4_201453151126320_wRLCSEhFcnujmsXjgRrJsUgTerFjpKXiUoXkbjmU_jpeg.jpeg',
        imageUrl2: 'http://nextadventure.net/images/detailed/5/Dagger-Axis-10.5-Kayak-with-Skeg.jpg'
    },
    {
        title: 'kayak in Skokie',
        coords: [-87.754961, 42.027764],
        dailyPrice: 13,
        short: 'blue kayak in Skokie',
        city: 'Skokie',
        imageUrl: 'http://awesomobile.com/wp-content/uploads/2012/05/transparent-canoe-kayak-1.jpg'
    },
    {
        title: 'kayak in Oakpark',
        coords: [-87.784149, 41.885001],
        dailyPrice: 12,
        short: 'yellow kayak in Oakpark',
        city: 'Oakpark'
    },
    {
        title: 'kayak in Cicero',
        coords: [-87.754000, 41.843597],
        dailyPrice: 11,
        short: 'purple kayak in Cicero',
        city: 'Cicero',
        imageUrl: 'http://eofdreams.com/data_images/dreams/kayak/kayak-09.jpg',
        imageUrl2: 'http://nextadventure.net/images/detailed/5/Dagger-Axis-10.5-Kayak-with-Skeg.jpg'
    },
    {
        title: 'kayak in Edgewater',
        coords: [-87.661160, 41.987093],
        dailyPrice: 14,
        short: 'green kayak in Edgewater',
        city: 'Edgewater',
        imageUrl: 'http://img.grouponcdn.com/deal/eD33zWPLThJTUk8dsBkc/Nc-700x420/v1/c700x420.jpg',
        imageUrl2: 'http://nextadventure.net/images/detailed/5/Dagger-Axis-10.5-Kayak-with-Skeg.jpg'
    },
    {
        title: 'kayak in Naperville',
        coords: [-88.144202, 41.776833],
        dailyPrice: 10,
        short: 'black kayak in Naperville',
        city: 'Naperville',
        imageUrl: 'http://bestfishingkayakfocus.com/wp-content/uploads/2013/12/ocea-kayak-summer-colors-wallpapers-1024x768.jpg',
        imageUrl2: 'http://nextadventure.net/images/detailed/5/Dagger-Axis-10.5-Kayak-with-Skeg.jpg'
    },
    {
        title: 'kayak in Ottawa Illinois',
        coords: [-88.842378, 41.345543],
        dailyPrice: 5,
        short: 'white kayak in Ottawa Illinois',
        city: 'Ottawa',
        imageUrl: 'http://cdn.allsedona.com/images/content/21039_16996_Sedona_Arizona_Kayaking_md.jpg',
        imageUrl2: 'http://nextadventure.net/images/detailed/5/Dagger-Axis-10.5-Kayak-with-Skeg.jpg'
    },
    {
        title: 'bike in Indianapolis',
        coords: [-86.1580400, 39.7683800],
        dailyPrice: 10,
        short: 'mountain bike in Indianapolis',
        city: 'Indianapolis',
        imageUrl: 'http://2k13.konaworld.com/images/bikes/hires/lanai.jpg',
        imageUrl2: 'http://www.dexigner.com/news/image/22948/Thonet_Concept_Bike_04'
    },
    {
        title: 'kayak in Chicago kayak in Chicago kayak in Chicago kayak in Chicago kayak in Chicago',
        coords: [-87.6500500, 41.8500300],
        dailyPrice: 15,
        short: 'red kayak in Chicago red kayak in Chicago red kayak in Chicago',
        city: 'Chicago',
        imageUrl: 'http://media.phuketgazette.net/images/articles/2014/4_201453151126320_wRLCSEhFcnujmsXjgRrJsUgTerFjpKXiUoXkbjmU_jpeg.jpeg',
        imageUrl2: 'http://nextadventure.net/images/detailed/5/Dagger-Axis-10.5-Kayak-with-Skeg.jpg'
    },
    {
        title: 'kayak in Skokie',
        coords: [-87.754961, 42.027764],
        dailyPrice: 13,
        short: 'blue kayak in Skokie',
        city: 'Skokie',
        imageUrl: 'http://awesomobile.com/wp-content/uploads/2012/05/transparent-canoe-kayak-1.jpg'
    },
    {
        title: 'kayak in Oakpark',
        coords: [-87.784149, 41.885001],
        dailyPrice: 12,
        short: 'yellow kayak in Oakpark',
        city: 'Oakpark'
    },
    {
        title: 'kayak in Cicero',
        coords: [-87.754000, 41.843597],
        dailyPrice: 11,
        short: 'purple kayak in Cicero',
        city: 'Cicero',
        imageUrl: 'http://eofdreams.com/data_images/dreams/kayak/kayak-09.jpg',
        imageUrl2: 'http://nextadventure.net/images/detailed/5/Dagger-Axis-10.5-Kayak-with-Skeg.jpg'
    },
    {
        title: 'kayak in Edgewater',
        coords: [-87.661160, 41.987093],
        dailyPrice: 14,
        short: 'green kayak in Edgewater',
        city: 'Edgewater',
        imageUrl: 'http://img.grouponcdn.com/deal/eD33zWPLThJTUk8dsBkc/Nc-700x420/v1/c700x420.jpg',
        imageUrl2: 'http://nextadventure.net/images/detailed/5/Dagger-Axis-10.5-Kayak-with-Skeg.jpg'
    },
    {
        title: 'kayak in Naperville',
        coords: [-88.144202, 41.776833],
        dailyPrice: 10,
        short: 'black kayak in Naperville',
        city: 'Naperville',
        imageUrl: 'http://bestfishingkayakfocus.com/wp-content/uploads/2013/12/ocea-kayak-summer-colors-wallpapers-1024x768.jpg',
        imageUrl2: 'http://nextadventure.net/images/detailed/5/Dagger-Axis-10.5-Kayak-with-Skeg.jpg'
    },
    {
        title: 'kayak in Ottawa Illinois',
        coords: [-88.842378, 41.345543],
        dailyPrice: 5,
        short: 'white kayak in Ottawa Illinois',
        city: 'Ottawa',
        imageUrl: 'http://cdn.allsedona.com/images/content/21039_16996_Sedona_Arizona_Kayaking_md.jpg',
        imageUrl2: 'http://nextadventure.net/images/detailed/5/Dagger-Axis-10.5-Kayak-with-Skeg.jpg'
    },
    {
        title: 'bike in Indianapolis',
        coords: [-86.1580400, 39.7683800],
        dailyPrice: 10,
        short: 'mountain bike in Indianapolis',
        city: 'Indianapolis',
        imageUrl: 'http://2k13.konaworld.com/images/bikes/hires/lanai.jpg',
        imageUrl2: 'http://www.dexigner.com/news/image/22948/Thonet_Concept_Bike_04'
    }
];

module.exports = {

    overwriteDBWithSampleData: function (callback) {

        User.destroy().exec(function () {
            util.log('Users deleted');
            ListingImage.destroy().exec(function () {
                util.log('Listing images deleted');
            });

            Listing.destroy().exec(function () {
                util.log('Listings deleted');
                User.create({ firstName: 'test', lastName: 'test', username: 'test', password: 'test', email: 'usenkanov@gmail.com' }).exec(function (err, created) {
                    if (err) {
                        util.error('User creation failed... exiting', err);
                        return;
                    }
                    util.log('Created user with username ' + created.username);

                    var indexes = _.range(0, listings.length);
                    async.forEach(indexes, function (index, listingsCallback) {
                        var listing = listings[index];
                        var priceObject = {
                            daily: listing.dailyPrice
                        };

                        Listing.create({
                            title: listing.title,
                            owner: created,
                            price: priceObject,
                            location: { type: 'Point', coordinates: listing.coords },
                            description: {
                                short: listing.short,
                                long: listing.short + ' ' + listing.short
                            },
                            deposit: {
                                required: true,
                                amount: 5
                            },
                            address: { city: listing.city },
                            displayedAddress: listing.city
                        })
                            .exec(function (err, createdListing) {
                                if (err) {
                                    listingsCallback(err);
                                }
                                util.log('Created listing : ' + createdListing.title);
                                ListingImage.create({ thumbUrl: listing.imageUrl, fullUrl: listing.imageUrl, caption: 'i\'m a main image', listing: createdListing });
                                ListingImage.create({ thumbUrl: listing.imageUrl2, fullUrl: listing.imageUrl2, caption: 'i\'m a second image', listing: createdListing });
                                listingsCallback();
                            });

                    }, function (err) {
                        if (err) {
                            util.error('Error creating a listing', err);
                            callback(err);
                        }
                        Listing.native(function (err, collection) {
                            collection.ensureIndex({ 'location': '2dsphere' }, function () {
                                util.log('2dsphere index created');
                            });
                        });
                        if (callback) {
                            callback();
                        }
                    });

                });
            });
        });
    }
};
