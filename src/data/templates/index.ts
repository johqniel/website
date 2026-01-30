import templateEins from './template_eins.json';
import templateZwei from './template_zwei.json';
import templateDrei from './template_drei.json';
import templateVier from './template_vier.json';
import templateFuenf from './template_fuenf.json';
import templateSechs from './template_sechs.json';
import templateSieben from './template_sieben.json';
import templateAcht from './template_acht.json';

const templates: Record<string, any> = {
    "template_eins": templateEins,
    "template_zwei": templateZwei,
    "template_drei": templateDrei,
    "template_vier": templateVier,
    "template_fuenf": templateFuenf,
    "template_sechs": templateSechs,
    "template_sieben": templateSieben,
    "template_acht": templateAcht,
    // Mapping "example" to one of them for backward compatibility
    "example": templateEins
};

export default templates;
