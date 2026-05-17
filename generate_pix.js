function crc16(buffer) {
    let crc = 0xFFFF;
    for (let i = 0; i < buffer.length; i++) {
        crc ^= buffer.charCodeAt(i) << 8;
        for (let j = 0; j < 8; j++) {
            if ((crc & 0x8000) > 0) crc = (crc << 1) ^ 0x1021;
            else crc = crc << 1;
        }
    }
    return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
}

function createPixBRCode(key, amount, name, city, transactionId = 'DEV123') {
  const formatLength = (id, value) => {
    const valStr = String(value);
    const len = valStr.length.toString().padStart(2, '0');
    return `${id}${len}${valStr}`;
  };

  const payloadFormatIndicator = '000201';
  const pointOfInitiationMethod = '010212';
  
  const gui = formatLength('00', 'br.gov.bcb.pix');
  const keyInfo = formatLength('01', key);
  const merchantAccountInfo = formatLength('26', gui + keyInfo);
  
  const merchantCategoryCode = '52040000';
  const transactionCurrency = '5303986';
  const transactionAmount = amount ? formatLength('54', amount.toFixed(2)) : '';
  const countryCode = '5802BR';
  const merchantName = formatLength('59', name);
  const merchantCity = formatLength('60', city);
  
  const txId = formatLength('05', transactionId);
  const additionalDataField = formatLength('62', txId);
  
  const payloadToCRC = [
    payloadFormatIndicator,
    pointOfInitiationMethod,
    merchantAccountInfo,
    merchantCategoryCode,
    transactionCurrency,
    transactionAmount,
    countryCode,
    merchantName,
    merchantCity,
    additionalDataField,
    '6304'
  ].join('');

  const crcResult = crc16(payloadToCRC);
  
  return payloadToCRC + crcResult;
}

console.log(createPixBRCode('dev@vynta.com.br', 19.90, 'Vynta DEV', 'SAO PAULO'));
