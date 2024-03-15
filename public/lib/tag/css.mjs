export default function cssTemplate(strings, ...keys) {
  const evaluated = strings.reduce((acc, string, i) => {
    acc.push(string)
    if (values[i]) acc.push(values[i].toString())

    return acc
  }, []);

  const stylesheet = new CSSStyleSheet();
  stylesheet.replaceSync(evaluated);

  return stylesheet;
}