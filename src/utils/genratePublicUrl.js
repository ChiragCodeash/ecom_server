const genratePublicUrl =(pathname , file)=>{
    const url = process.env.URL + "/" + pathname + "/" + file
    return url

}

module.exports = genratePublicUrl