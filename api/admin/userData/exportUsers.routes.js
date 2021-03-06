let { Router } = require('express');
let router = Router();
let passport = require('passport');
let { readTransaction } = require('../../../utils/neo4j');
let { GET_USER_DATA } = require('../../../queries/userQuerys');
let fs = require('fs');
let path = require('path');
let ExcelJS = require('exceljs');
let moment = require('moment');
let { v4 } = require('uuid');
let { createCanvas } = require('canvas');
let { Chart } = require('chart.js');
let Intl = require('@formatjs/intl-numberformat');

/**
 * @openapi
 * /api/v1/admin/exportUser:
 *   get:
 *     description: Get all data for user.
 *     tags: [Admin]
 *     produces:
 *       - application/text
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Returns data or error.
 *       401:
 *         description: Returns "Unauthorized".
 */
router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  async (request, response) => {
    let { user } = request;
    let { id } = request.params;

    if (user.type !== 'admin') return response.status(401);

    await readTransaction(
      {
        statement: `MATCH (user:User) WHERE NOT (user.email = "admin@purposeapp") WITH apoc.map.removeKey(user {.*}, 'password') as user RETURN user`,
      },
      async (error, result) => {
        if (error)
          return response
            .status(200)
            .json({ message: 'Error while retrieving user.', error });
        else {
          let records = result.records;

          let users = [];

          records.map(async (record, index, array) => {
            let user = record.get('user');
            let products = [];
            let sales = [];

            await readTransaction({
              statement: `MATCH (user:User)-[:SELLS]->(product:Product) WHERE user.id = "${user.id}" RETURN apoc.map.removeKey(product {.*}, '') as product`
            }, async (error, result) => {
              if (error) return;
              else {
                result.records.map((record) => {
                  products.push(record.get("product"));
                });
              }
            });

            // MATCH (user:User)-[:PRODUCES]->(produce:Product), apoc.map.removeKey(produce {.*}, '') as produce
            await readTransaction({
              statement: `MATCH (user:User)-[:PRODUCES]->(produce:Product) WHERE user.id = "${user.id}" RETURN apoc.map.removeKey(produce {.*}, '') as produce`
            }, async (error, result) => {
              if (error) return;
              else {
                result.records.map((record) => {
                  products.push(record.get("produce"));
                });
              }
            });

            await readTransaction({
              statement: `MATCH (user:User)-[:USER_SALE]->(sale:Sale)-[:SALE_PRODUCT]->(product:Product) WHERE user.id = "${user.id}" RETURN apoc.map.removeKey(sale {.*}, '') as sale, apoc.map.removeKey(product {.*}, '') as product`
            }, async (error, result) => {
              if (error) return;
              else {
                result.records.map(async (record) => {
                  let sale = record.get("sale");
                  let product = record.get("product");

                  sales.push({ ...sale, product });
                });
              }
            });

            users.push({ ...user, products, sales });

            if (index === records.length - 1) {
              let salesData = [];
              let productsData = [];

              let usersData = users.map((user) => {
                let sales = user.sales;
                let products = user.products;

                sales.forEach((sale) => salesData.push(sale));
                products.forEach((product) => productsData.push(product));

                delete user.sales;
                delete user.products;

                return user;
              });

              await generateExcel(usersData, salesData, productsData, (path) => {
                response.set(
                  'Content-disposition',
                  'attachment; filename=purpose-users-data.xlsx'
                );
                response.set(
                  'Content-type',
                  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64'
                );
                response.status(200).download(path);

                setTimeout(() => {
                  fs.unlinkSync(path);
                }, 30000);
              });
            }
          });
        }
      }
    );
  }
);

let generateExcel = async (users, sales, products, callback = (path) => { }) => {
  let workbook = new ExcelJS.Workbook();

  workbook.creator = 'Purpose360';
  workbook.lastModifiedBy = 'Purpose360 Server';
  workbook.created = new Date();
  workbook.modified = new Date();

  let userProfilesSheet = workbook.addWorksheet('Profile', {
    headerFooter: { firstHeader: 'Profile' },
  });

  userProfilesSheet.columns = [
    { header: 'First Name', key: 'firstName' },
    {
      header: 'Last Name',
      key: 'lastName',
    },
    { header: 'Email', key: 'email' },
    { header: 'Business Name', key: 'displayName' },
    {
      header: 'Business Type',
      key: 'type',
    },
    { header: 'Business Description', key: 'typeDescription' },
    {
      header: 'Business Registration Number',
      key: 'registrationNumber',
    },
    { header: 'Bank Account Number', key: 'accountNumber' },
    {
      header: 'Bank Name',
      key: 'bankName',
    },
    { header: 'Bank Branch Code', key: 'bankBranch' },
    {
      header: 'Street Address',
      key: 'streetAddress',
    },
    { header: 'Suburb', key: 'suburb' },
    { header: 'Ward', key: 'ward' },
    {
      header: 'City',
      key: 'city',
    },
    { header: 'Area Code', key: 'areaCode' },
    { header: 'Province', key: 'province' },
    {
      header: 'Country',
      key: 'country',
    },
  ];

  users.forEach((user) => {
    userProfilesSheet.addRow({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      displayName: user.displayName || '',
      type: user.type || '',
      typeDescription: user.typeDescription || '',
      registrationNumber: user.registrationNumber || '',
      accountNumber: user.accountNumber || '',
      bankName: user.bankName || '',
      bankBranch: user.bankBranch || '',
      streetAddress: user.streetAddress || '',
      suburb: user.suburb || '',
      ward: user.ward || '',
      city: user.city || '',
      areaCode: user.areaCode || '',
      province: user.province || '',
      country: user.country || '',
    });
  });

  let userProductsSheet = workbook.addWorksheet('Products', {
    headerFooter: { firstHeader: 'Products' },
  });

  userProductsSheet.columns = [
    { header: 'Image', key: 'image' },
    { header: 'Name', key: 'name' },
    {
      header: 'Cost',
      key: 'cost',
    },
    { header: 'Price', key: 'price' },
  ];

  let imageRow = 2;

  products.forEach((d) => {
    let imageData = d.image.split(';');
    let contentType = imageData[0].replace('data:', '');
    let image = imageData[1].replace('base64,', '');
    let bytes = atob(image);
    let byteNumbers = new Array(bytes.length);

    for (let i = 0; i < bytes.length; i++) {
      byteNumbers[i] = bytes.charCodeAt(i);
    }

    let byteArray = new Uint8Array(byteNumbers);

    let imagePath = path.join(
      process.cwd(),
      'temp',
      v4() + '.' + contentType.split('/')[1]
    );

    fs.writeFileSync(imagePath, byteArray);

    let imageId = workbook.addImage({
      filename: imagePath,
      extension: contentType.split('/')[1],
    });

    userProductsSheet.addImage(imageId, `A${imageRow}:A${imageRow}`);

    userProductsSheet.addRow({
      name: d.name || '',
      cost: d.cost ? 'R ' + d.cost || '' : '',
      price: 'R ' + d.price || '',
    });

    imageRow++;
  });

  let userSalesSheet = workbook.addWorksheet('Sales', {
    headerFooter: { firstHeader: 'Sales' },
  });

  userSalesSheet.columns = [
    { header: 'Date', key: 'date' },
    {
      header: 'Number Sold',
      key: 'numberSold',
    },
    { header: 'Profit', key: 'profit' },
    { header: 'Product Name', key: 'productName' },
    { header: 'Product Cost', key: 'productCost' },
    { header: 'Product Price', key: 'productPrice' },
  ];

  sales.forEach((d) => {
    userSalesSheet.addRow({
      date: moment(d.date).format('dddd/MM/YYYY') || '',
      numberSold: d.numberSold || '',
      profit: 'R ' + d.profit || '',
      productName: d.product.name || '',
      productCost: 'R ' + d.product.cost || '',
      productPrice: 'R ' + d.product.price || '',
    });
  });

  userProfilesSheet.columns.forEach((column) => {
    const lengths = column.values.map((v) => v.toString().length);
    column.width = Math.max(...lengths.filter((v) => typeof v === 'number'));
  });

  userProductsSheet.columns.forEach((column) => {
    const lengths = column.values.map((v) => v.toString().length);
    column.width = Math.max(...lengths.filter((v) => typeof v === 'number'));
  });

  userSalesSheet.columns.forEach((column) => {
    const lengths = column.values.map((v) => v.toString().length);
    column.width = Math.max(...lengths.filter((v) => typeof v === 'number'));
  });

  workbook.xlsx
    .writeFile(path.join(process.cwd(), 'temp', 'purpose-users-data.xlsx'))
    .then(() => {
      callback(path.join(process.cwd(), 'temp', 'purpose-users-data.xlsx'));
    });
};

module.exports = router;
