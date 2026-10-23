import { MenuProduct, CategoryId } from '../types';
import pizzaCalabresaImg from '../assets/images/pizza_calabresa_1790348249874.jpg';
import pizzaMargheritaImg from '../assets/images/pizza_margherita_card_1790465379380.jpg';
import pizzaQuatroQueijosImg from '../assets/images/pizza_quatro_queijos_card_1790465389818.jpg';
import pizzaPortuguesaImg from '../assets/images/pizza_portuguesa_card_1790465402311.jpg';
import pizzaFrangoCatupiryCardImg from '../assets/images/pizza_frango_catupiry_topdown_1790825991205.jpg';
import pizzaMussarelaCardImg from '../assets/images/pizza_mussarela_topdown_1790828295470.jpg';
import pizzaDoceNutellaImg from '../assets/images/pizza_doce_nutella_1791299330523.jpg';
import esfihasImg from '../assets/images/esfihas_artesanais_1791308409043.jpg';
import bebidaSodaItalianaImg from '../assets/images/bebida_soda_italiana_1791299339550.jpg';
import tortaBlueberryImg from '../assets/images/torta_blueberry_1790348262333.jpg';
import bannerComboImg from '../assets/images/banner_combinacoes_pizza_1790465413844.jpg';

export interface CategoryInfo {
  id: CategoryId;
  name: string;
  count: number;
}

export const CATEGORIES: CategoryInfo[] = [
  { id: 'pizzas', name: 'Pizzas', count: 8 },
  { id: 'acai', name: 'Açaí', count: 5 },
  { id: 'pizzas-doces', name: 'Pizzas Doces', count: 4 },
  { id: 'esfihas', name: 'Esfihas', count: 5 },
  { id: 'bebidas', name: 'Bebidas', count: 4 },
  { id: 'sobremesas', name: 'Sobremesas', count: 3 },
];

export const MENU_PRODUCTS: MenuProduct[] = [
  // As 4 Mais Pedidas (Destaques da vitrine)
  {
    id: 'pizza-calabresa',
    name: 'Calabresa',
    description: 'Molho de tomate, muçarela, calabresa e cebola.',
    price: 49.9,
    image: pizzaCalabresaImg,
    category: 'pizzas',
    featured: true,
  },
  {
    id: 'pizza-margherita',
    name: 'Margherita',
    description: 'Molho de tomate, muçarela, tomate cereja e manjericão.',
    price: 46.9,
    image: pizzaMargheritaImg,
    category: 'pizzas',
    featured: true,
  },
  {
    id: 'pizza-quatro-queijos',
    name: 'Quatro Queijos',
    description: 'Muçarela, parmesão, provolone e gorgonzola.',
    price: 54.9,
    image: pizzaQuatroQueijosImg,
    category: 'pizzas',
    featured: true,
  },
  {
    id: 'pizza-portuguesa',
    name: 'Portuguesa',
    description: 'Molho de tomate, muçarela, presunto, ovo, cebola e azeitona.',
    price: 52.9,
    image: pizzaPortuguesaImg,
    category: 'pizzas',
    featured: true,
  },

  // Pizzas Salgadas Adicionais
  {
    id: 'pizza-frango-catupiry',
    name: 'Frango com Catupiry',
    description: 'Frango desfiado temperado, muito catupiry e um toque especial de orégano.',
    price: 52.9,
    image: pizzaFrangoCatupiryCardImg,
    category: 'pizzas',
    isCombo: true,
  },
  {
    id: 'pizza-mussarela',
    name: 'Mussarela Clássica',
    description: 'Massa artesanal, molho especial e muita mussarela derretida. A clássica que nunca sai de moda.',
    price: 44.9,
    image: pizzaMussarelaCardImg,
    category: 'pizzas',
    isCombo: true,
  },
  {
    id: 'pizza-pepperoni-especial',
    name: 'Pepperoni Premium',
    description: 'Molho San Marzano, muçarela de búfala, pepperoni crocante e mel trufado.',
    price: 58.9,
    image: pizzaCalabresaImg,
    category: 'pizzas',
    isCombo: true,
  },
  {
    id: 'pizza-caprese-artesanale',
    name: 'Caprese Artesanal',
    description: 'Muçarela fresca, tomates assados, pesto de manjericão e redução balsâmica.',
    price: 56.9,
    image: pizzaMargheritaImg,
    category: 'pizzas',
    isCombo: true,
  },

  // AÇAÍ ARTESANAL & TIGELAS
  {
    id: 'acai-copo-300',
    name: 'Açaí no Copo 300ml',
    description: 'Açaí cremoso batido com xarope de guaraná artesanal, acompanhado de fatias de banana fresca e granola crocante.',
    price: 18.9,
    image: tortaBlueberryImg,
    category: 'acai',
    featured: true,
  },
  {
    id: 'acai-copo-500',
    name: 'Açaí no Copo 500ml Turbinado',
    description: 'Camadas generosas de açaí puro, leite em pó Ninho, leite condensado, morangos frescos fatiados e granola.',
    price: 24.9,
    image: tortaBlueberryImg,
    category: 'acai',
    featured: true,
    isCombo: true,
  },
  {
    id: 'acai-copo-700',
    name: 'Açaí no Copo 700ml Mega Especial',
    description: 'Açaí ultra cremoso, paçoca de amendoim, morangos, banana, leite Ninho e cobertura artesanal de chocolate.',
    price: 31.9,
    image: tortaBlueberryImg,
    category: 'acai',
    isCombo: true,
  },
  {
    id: 'acai-tigela-trufada',
    name: 'Tigela de Açaí Trufada com Nutella',
    description: 'Açaí servido na tigela com borda generosa de Nutella pura, leite Ninho em pó, morangos frescos e castanhas.',
    price: 28.9,
    image: tortaBlueberryImg,
    category: 'acai',
    isCombo: true,
  },
  {
    id: 'acai-barca-gourmet',
    name: 'Barca Especial de Açaí Cantinho',
    description: 'Barca recheada de açaí cremoso com morangos, rodelas de banana, Nutella, leite Ninho, paçoca e tubetes crocantes. Perfeita para compartilhar!',
    price: 54.9,
    image: tortaBlueberryImg,
    category: 'acai',
    isCombo: true,
  },

  // PIZZAS DOCES
  {
    id: 'pizza-nutella-morango',
    name: 'Nutella com Morango',
    description: 'Creme de avelã Nutella genuíno, morangos frescos fatiados e raspas de chocolate branco belga.',
    price: 56.9,
    image: pizzaDoceNutellaImg,
    category: 'pizzas-doces',
    isCombo: true,
  },
  {
    id: 'pizza-banana-canela',
    name: 'Banana com Canela & Doce de Leite',
    description: 'Fatias de banana caramelizada no forno, doce de leite artesanal cremoso e canela polvilhada.',
    price: 48.9,
    image: pizzaDoceNutellaImg,
    category: 'pizzas-doces',
  },
  {
    id: 'pizza-romeu-julieta',
    name: 'Romeu & Julieta Artesanal',
    description: 'Goiabada cascão cremosa derretida no forno a lenha com queijo minas curado especial.',
    price: 49.9,
    image: pizzaDoceNutellaImg,
    category: 'pizzas-doces',
  },
  {
    id: 'pizza-chocolate-frutas-vermelhas',
    name: 'Chocolate com Frutas Vermelhas',
    description: 'Chocolate meio amargo nobre, calda artesanal de amora, framboesa e mirtilos frescos.',
    price: 58.9,
    image: pizzaDoceNutellaImg,
    category: 'pizzas-doces',
    isCombo: true,
  },

  // ESFIHAS ARTESANAIS
  {
    id: 'esfiha-carne-artesanal',
    name: 'Esfiha de Carne Temperada',
    description: 'Massa macia e dourada com carne bovina selecionada, tomate picado, cebola, hortelã e gotas de limão.',
    price: 8.9,
    image: esfihasImg,
    category: 'esfihas',
    isCombo: true,
  },
  {
    id: 'esfiha-queijo-catupiry',
    name: 'Esfiha de Queijo & Catupiry',
    description: 'Massa aberta com queijo muçarela derretido, requeijão cremoso catupiry e orégano fresco.',
    price: 9.5,
    image: esfihasImg,
    category: 'esfihas',
    isCombo: true,
  },
  {
    id: 'esfiha-frango-catupiry',
    name: 'Esfiha de Frango com Catupiry',
    description: 'Peito de frango desfiado temperado na ponta da faca com cobertura cremosa de catupiry.',
    price: 9.5,
    image: esfihasImg,
    category: 'esfihas',
  },
  {
    id: 'esfiha-calabresa',
    name: 'Esfiha de Calabresa Curada',
    description: 'Calabresa defumada moída com cebola fresca, azeite extravirgem e azeitona.',
    price: 8.9,
    image: esfihasImg,
    category: 'esfihas',
  },
  {
    id: 'esfiha-doce-nutella',
    name: 'Esfiha Doce de Nutella & Ninho',
    description: 'Esfiha aberta com generosa camada de Nutella cremosa e leite Ninho polvilhado.',
    price: 11.9,
    image: esfihasImg,
    category: 'esfihas',
    isCombo: true,
  },

  // BEBIDAS
  {
    id: 'bebida-soda-italiana',
    name: 'Soda Italiana de Frutas Vermelhas',
    description: 'Xarope artesanal de frutas silvestres, água com gás cristalina, gelo e hortelã fresca.',
    price: 16.9,
    image: bebidaSodaItalianaImg,
    category: 'bebidas',
    isCombo: true,
  },
  {
    id: 'bebida-suco-natural',
    name: 'Suco Natural da Estação',
    description: 'Suco 100% natural prensado na hora, servido bem gelado.',
    price: 14.9,
    image: bebidaSodaItalianaImg,
    category: 'bebidas',
  },
  {
    id: 'bebida-refrigerante-artesanal',
    name: 'Refrigerante Artesanal da Casa',
    description: 'Elaborado com extratos botânicos e borbulhas finas refrescantes.',
    price: 12.9,
    image: bebidaSodaItalianaImg,
    category: 'bebidas',
  },
  {
    id: 'bebida-vinho-chianti',
    name: 'Vinho Tinto Italiano Chianti DOCG',
    description: 'Garrafa 750ml, harmonização perfeita com pizzas artesanais e molhos especiais.',
    price: 89.9,
    image: bebidaSodaItalianaImg,
    category: 'bebidas',
  },

  // SOBREMESAS
  {
    id: 'sobremesa-torta-blueberry',
    name: 'Torta Artesanal de Mirtilo Frutella',
    description: 'Massa sablée amanteigada com creme pâtissière e cobertura de mirtilos frescos.',
    price: 34.9,
    image: tortaBlueberryImg,
    category: 'sobremesas',
    isCombo: true,
  },
  {
    id: 'sobremesa-tiramisu',
    name: 'Tiramisù Tradicional Italiano',
    description: 'Biscoitos savoiardi embebidos em café espresso, creme de mascarpone e cacau em pó 100%.',
    price: 28.9,
    image: tortaBlueberryImg,
    category: 'sobremesas',
  },
  {
    id: 'sobremesa-petit-gateau',
    name: 'Petit Gâteau com Sorvete Artesanal',
    description: 'Bolo quente com recheio cremoso de chocolate belga, acompanhado de sorvete de baunilha.',
    price: 29.9,
    image: tortaBlueberryImg,
    category: 'sobremesas',
  },
];

export const BANNER_IMAGE = bannerComboImg;
