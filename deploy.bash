aws s3 sync .output/public/ s3://javascript-spreadsheet-nuxt3-static --cache-control max-age=31536000 --delete --region us-west-2

# aws s3 sync .output/public/ s3://static.example.com --cache-control max-age=31536000 --delete --profile aws-profile --region aws-region