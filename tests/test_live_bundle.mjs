async function test() {
  const html = await fetch('https://split-m.web.app').then(r => r.text());
  const match = html.match(/src="([^"]*assets[^"]*index[^"]*\.js)"/);
  console.log('Index JS url on live site:', match ? match[1] : 'NOT FOUND');
  if (match) {
    const js = await fetch('https://split-m.web.app' + match[1]).then(r => r.text());
    console.log('Contains AIzaSyCe?', js.includes('AIzaSyCe'));
    console.log('Contains dummy-api-key?', js.includes('dummy-api-key'));
    console.log('Contains splitm-a1f60?', js.includes('splitm-a1f60'));
  }
}
test();
