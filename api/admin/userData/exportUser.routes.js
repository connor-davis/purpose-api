let { Router } = require('express');
let router = Router();
let passport = require('passport');
let { readTransaction } = require('../../../utils/neo4j');
let { GET_USER_DATA, GET_USER } = require('../../../queries/userQuerys');
let fs = require('fs');
let path = require('path');
let ExcelJS = require('exceljs');
let moment = require('moment');
let { v4 } = require('uuid');
let { createCanvas } = require('canvas');
let { Chart } = require('chart.js');
let Intl = require('@formatjs/intl-numberformat');
const { GET_SALES } = require('../../../queries/salesQuerys');
const { GET_PRODUCTS } = require('../../../queries/productQuerys');
const { GET_ALL_PRODUCE_USER, GET_ALL_HARVESTED_USER } = require('../../../queries/ecd/ecdQuerys');

/**
 * @openapi
 * /api/v1/admin/exportUser/:id:
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
  '/:id',
  passport.authenticate('jwt', { session: false }),
  async (request, response) => {
    let { user } = request;
    let { id } = request.params;

    if (user.type !== 'admin') return response.status(401);

    await readTransaction(GET_USER({ id }, true), async (error, result) => {
      if (error)
        return response
          .status(200)
          .json({ message: 'Error while retrieving user.', error });
      else {
        let record = result.records[0];
        let user = record.get("user");

        if (user.type === "earlyChildhoodDevelopmentCenter") {
          await readTransaction(GET_SALES(user.id), async (error, result) => {
            if (error)
              return response
                .status(200)
                .json({ message: 'Error while retrieving user.', error });
            else {
              let records = result.records;
              let sales = [];

              records.map((record) => {
                let sale = record.get("sale");
                let product = record.get("product");

                sales.push({ ...sale, product });
              });

              await readTransaction(GET_ALL_PRODUCE_USER(user.id), async (error, result) => {
                if (error)
                  return response
                    .status(200)
                    .json({ message: 'Error while retrieving user.', error });
                else {
                  let records = result.records;
                  let produce = [];

                  records.map((record) => {
                    let product = record.get("produce");

                    produce.push(product);
                  });

                  await readTransaction(GET_ALL_HARVESTED_USER(user.id), async (error, result) => {
                    if (error) { }
                    else {
                      let records = result.records;
                      let harvests = [];

                      records.map((record) => {
                        let harvest = record.get("harvested");

                        harvests.push(harvest);
                      });

                      console.log(user, sales, produce, harvests);

                      await generateExcelEcd(user, sales, produce, harvests, (path) => {
                        response.set(
                          'Content-disposition',
                          'attachment; filename=' + user.email + '-data.xlsx'
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
                  })
                }
              });
            }
          });
        } else {
          await readTransaction(GET_SALES(user.id), async (error, result) => {
            if (error)
              return response
                .status(200)
                .json({ message: 'Error while retrieving user.', error });
            else {
              let records = result.records;
              let sales = [];

              records.map((record) => {
                let sale = record.get("sale");
                let product = record.get("product");

                sales.push({ ...sale, product });
              });

              await readTransaction(GET_PRODUCTS(user.id), async (error, result) => {
                if (error)
                  return response
                    .status(200)
                    .json({ message: 'Error while retrieving user.', error });
                else {
                  let records = result.records;
                  let products = [];

                  records.map((record) => {
                    let product = record.get("product");

                    products.push(product);
                  });

                  console.log(user, sales, products);

                  await generateExcel(user, sales, products, (path) => {
                    response.set(
                      'Content-disposition',
                      'attachment; filename=' + user.email + '-data.xlsx'
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
          });
        }
      }
    });
  }
);

let generateExcel = async (user, sales, products, callback = (path) => { }) => {
  let workbook = new ExcelJS.Workbook();

  workbook.creator = 'Purpose360';
  workbook.lastModifiedBy = 'Purpose360 Server';
  workbook.created = new Date();
  workbook.modified = new Date();

  let userProfileSheet = workbook.addWorksheet('Profile', {
    headerFooter: { firstHeader: 'Profile' },
  });

  userProfileSheet.columns = [
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

  userProfileSheet.addRow({
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
      cost: 'R ' + d.cost || '',
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
  ];

  sales.forEach((d) => {
    userSalesSheet.addRow({
      date: moment(d.date).format('dddd/MM/YYYY') || '',
      numberSold: d.numberSold || '',
      profit: 'R ' + d.profit || '',
      productName: d.product.name || '',
    });
  });

  userProfileSheet.columns.forEach((column) => {
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

  let profitGraphSheet = workbook.addWorksheet('Profit Graph', {
    headerFooter: { firstHeader: 'Profit Graph' },
  });

  profitGraphSheet.columns = [
    { header: '2022', key: 'graph2022', width: 1080 / 2 },
  ];

  let canvas = createCanvas(1920, 1080);
  let context = canvas.getContext('2d');

  let months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  let calculateMonthProfit = (year, month, sales) => {
    let profit = 0;

    sales.map((sale) => {
      let saleMonth = moment(sale.date).format('MMMM');
      let saleYear = moment(sale.date).format('YYYY');

      if (saleMonth === month && saleYear === year) profit += sale.profit;

      return sale;
    });

    return profit;
  };

  let getYearProfits = (year) => {
    return [
      ...months.map((month) => {
        return {
          x: month,
          y: calculateMonthProfit(year, month, sales),
        };
      }),
    ];
  };

  let data = {
    labels: months,
    datasets: [
      {
        label: '2022',
        type: 'line',
        data: getYearProfits('2022'),
        backgroundColor: 'rgba(163, 230, 53, 1)',
        borderColor: 'rgba(163, 230, 53, 0.5)',
        fill: false,
        tension: 0.4,
        cubicInterpolationMode: 'monotone',
        pointStyle: 'circle',
        pointRadius: 4,
        pointHoverRadius: 5,
      },
    ],
  };

  new Chart(context, {
    type: 'line',
    data: data,
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: '',
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              let label = '';

              if (context.parsed.y !== null) {
                label += new Intl.NumberFormat('en-ZA', {
                  style: 'currency',
                  currency: 'ZAR',
                }).format(context.parsed.y);
              }

              return label;
            },
          },
        },
      },
      interaction: {
        intersect: false,
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
          },
        },
        y: {
          display: true,
          title: {
            display: true,
            text: 'Value (R)',
          },
        },
      },
    },
  });

  let canvasImage = canvas.toDataURL();

  let imageData = canvasImage.split(';');
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

  profitGraphSheet.addImage(imageId, `A2:A2`);

  profitGraphSheet.getRow(2).height = 1080 / 4;

  workbook.xlsx
    .writeFile(path.join(process.cwd(), 'temp', user.email + '-data.xlsx'))
    .then(() => {
      callback(path.join(process.cwd(), 'temp', user.email + '-data.xlsx'));

      fs.unlinkSync(imagePath);
    });
};

let generateExcelEcd = async (user, sales, produce, harvests, callback = (path) => { }) => {
  let workbook = new ExcelJS.Workbook();

  workbook.creator = 'Purpose360';
  workbook.lastModifiedBy = 'Purpose360 Server';
  workbook.created = new Date();
  workbook.modified = new Date();

  let userProfileSheet = workbook.addWorksheet('Profile', {
    headerFooter: { firstHeader: 'Profile' },
  });

  userProfileSheet.columns = [
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

  userProfileSheet.addRow({
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

  let userProductsSheet = workbook.addWorksheet('Produce', {
    headerFooter: { firstHeader: 'Produce' },
  });

  userProductsSheet.columns = [
    { header: 'Image', key: 'image' },
    { header: 'Name', key: 'name' },
    { header: 'Price', key: 'price' },
  ];

  let imageRow = 2;

  produce.forEach((d) => {
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
  ];

  sales.forEach((d) => {
    userSalesSheet.addRow({
      date: moment(d.date).format('dddd/MM/YYYY') || '',
      numberSold: d.numberSold || '',
      profit: 'R ' + d.profit || '',
      productName: d.product.name || '',
    });
  });

  let userHarvestsSheet = workbook.addWorksheet('Harvests', {
    headerFooter: { firstHeader: 'Harvests' },
  });

  userHarvestsSheet.columns = [
    { header: 'Date', key: 'date' },
    {
      header: 'Number Sold',
      key: 'numberSold',
    },
    { header: 'Profit', key: 'profit' },
    { header: 'Product Name', key: 'productName' },
  ];

  harvests.forEach((d) => {
    userHarvestsSheet.addRow({
      date: moment(d.date).format('dddd/MM/YYYY') || '',
      numberSold: d.numberSold || '',
      profit: 'R ' + d.profit || '',
      productName: d.productName || '',
    });
  });

  userProfileSheet.columns.forEach((column) => {
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

  userHarvestsSheet.columns.forEach((column) => {
    const lengths = column.values.map((v) => v.toString().length);
    column.width = Math.max(...lengths.filter((v) => typeof v === 'number'));
  });

  let profitGraphSheet = workbook.addWorksheet('Profit Graph', {
    headerFooter: { firstHeader: 'Profit Graph' },
  });

  profitGraphSheet.columns = [
    { header: '2022', key: 'graph2022', width: 1080 / 2 },
  ];

  let canvas = createCanvas(1920, 1080);
  let context = canvas.getContext('2d');

  let months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  let calculateMonthProfit = (year, month, sales) => {
    let profit = 0;

    sales.map((sale) => {
      let saleMonth = moment(sale.date).format('MMMM');
      let saleYear = moment(sale.date).format('YYYY');

      if (saleMonth === month && saleYear === year) profit += sale.profit;

      return sale;
    });

    return profit;
  };

  let getYearProfits = (year) => {
    return [
      ...months.map((month) => {
        return {
          x: month,
          y: calculateMonthProfit(year, month, sales),
        };
      }),
    ];
  };

  let data = {
    labels: months,
    datasets: [
      {
        label: '2022',
        type: 'line',
        data: getYearProfits('2022'),
        backgroundColor: 'rgba(163, 230, 53, 1)',
        borderColor: 'rgba(163, 230, 53, 0.5)',
        fill: false,
        tension: 0.4,
        cubicInterpolationMode: 'monotone',
        pointStyle: 'circle',
        pointRadius: 4,
        pointHoverRadius: 5,
      },
    ],
  };

  new Chart(context, {
    type: 'line',
    data: data,
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: '',
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              let label = '';

              if (context.parsed.y !== null) {
                label += new Intl.NumberFormat('en-ZA', {
                  style: 'currency',
                  currency: 'ZAR',
                }).format(context.parsed.y);
              }

              return label;
            },
          },
        },
      },
      interaction: {
        intersect: false,
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
          },
        },
        y: {
          display: true,
          title: {
            display: true,
            text: 'Value (R)',
          },
        },
      },
    },
  });

  let canvasImage = canvas.toDataURL();

  let imageData = canvasImage.split(';');
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

  profitGraphSheet.addImage(imageId, `A2:A2`);

  profitGraphSheet.getRow(2).height = 1080 / 4;

  workbook.xlsx
    .writeFile(path.join(process.cwd(), 'temp', user.email + '-data.xlsx'))
    .then(() => {
      callback(path.join(process.cwd(), 'temp', user.email + '-data.xlsx'));

      fs.unlinkSync(imagePath);
    });
};

module.exports = router;
