import { WebDriver, By } from 'selenium-webdriver';

import BasePage from './BasePage.js';
import { Product, SortOption } from '../types/index.js';

/**
 * Products Page Object
 * Represents the SauceDemo products/inventory page and its interactions
 */
export default class ProductsPage extends BasePage {
  private readonly pageTitle: By = By.css('.title');
  private readonly productItems: By = By.css('.inventory_item');
  private readonly productNames: By = By.css('.inventory_item_name');
  // private readonly productDescriptions: By = By.css('.inventory_item_desc');
  private readonly productPrices: By = By.css('.inventory_item_price');
  // private readonly addToCartButtons: By = By.css('button[id^="add-to-cart"]');
  // private readonly removeButtons: By = By.css('button[id^="remove"]');
  private readonly shoppingCart: By = By.css('.shopping_cart_link');
  private readonly cartBadge: By = By.css('.shopping_cart_badge');
  private readonly burgerMenu: By = By.id('react-burger-menu-btn');
  private readonly logoutLink: By = By.id('logout_sidebar_link');
  private readonly sortDropdown: By = By.css('[data-test="product_sort_container"]');


  constructor(driver: WebDriver) {
    super(driver);
  }

  /**
   * Check if user is on products page
   * @returns True if on products page
   */
  public async isOnProductsPage(): Promise<boolean> {
    try {
      const url = await this.getCurrentUrl();
      const titleDisplayed = await this.isElementDisplayed(this.pageTitle);
      return url.includes('inventory.html') && titleDisplayed;
    } catch (error) {
      return false;
    }
  }

  // Get page title text
  public async getPageTitleText(): Promise<string> {
    return await this.getElementText(this.pageTitle);
  }

  
  // Get number of products displayed
  public async getProductCount(): Promise<number> {
    const products = await this.findElements(this.productItems);
    return products.length;
  }

  // Get all products displayed on the page
  public async getAllProducts(): Promise<Product[]> {
    const products: Product[] = [];
    const productElements = await this.findElements(this.productItems);

    for (const element of productElements) {
      try {
        const name = await element.findElement(By.css('.inventory_item_name')).getText();
        const description = await element.findElement(By.css('.inventory_item_desc')).getText();
        const priceText = await element.findElement(By.css('.inventory_item_price')).getText();
        const price = parseFloat(priceText.replace("$", ''));

        products.push({name,description,priceText,price})

       
      } catch (error) {
        continue;
      }
    }

    return products;
  }


  /**
   * Get product names
   * @returns Array of product names
   */
  public async getProductNames(): Promise<string[]> {
    const nameElements = await this.findElements(this.productNames);
    const names: string[] = [];

    for (const element of nameElements) {
      names.push(await element.getText());
    }

    return names;
  }

  /**
   * Get product prices
   * @returns Array of product prices
   */
  public async getProductPrices(): Promise<number[]> {
    const priceElements = await this.findElements(this.productPrices);
    const prices: number[] = [];

    for (const element of priceElements) {
      const priceText = await element.getText();
      prices.push(parseFloat(priceText.replace("$", '')));
    }

    return prices;
  }

  /**
   * Add product to cart by name
   * @param productName - Name of the product to add
   */
  public async addProductToCartByName(productName: string): Promise<void> {
    try {
      const productId = productName.toLowerCase().replace(/\s+/g, '-');
      const addButton = By.id(`add-to-cart-${productId}`);
      await this.clickElement(addButton);
    } catch (error) {
      throw new Error(`Failed to add product "${productName}" to cart: ${(error as Error).message}`);
    }
  }

  public async getCartItemCount(): Promise<number> {
    try {
      if (await this.isElementDisplayed(this.cartBadge)) {
        const count = await this.getElementText(this.cartBadge);
        return parseInt(count, 10);
      }
      return 0;
    } catch (error) {
      return 0;
    }
  }

  public async addMultipleProductsToCart(productNames: string[]): Promise<void> {
    for (const name of productNames) {
      await this.addProductToCartByName(name);
    }
  }

  public async removeProductFromCartByName(productName: string): Promise<void> {
    try {
      const productId = productName.toLowerCase().replace(/\s+/g, '-');
      const removeButton = By.id(`remove-${productId}`);
      await this.clickElement(removeButton);
    } catch (error) {
      throw new Error(`Failed to remove product "${productName}": ${(error as Error).message}`);
    }
  }

  // Check if product is added to cart
  public async isProductInCart(productName: string): Promise<boolean> {
    try {
      const productId = productName.toLowerCase().replace(/\s+/g, '-');
      const removeButton = By.id(`remove-${productId}`);
      return await this.isElementDisplayed(removeButton);
    } catch (error) {
      return false;
    }
  }


  /**
   * Sort products
   * @param sortOption - Sort option (az, za, lohi, hilo)
   */
  public async sortProducts(sortOption: SortOption): Promise<void> {
    const dropdown = await this.findElement(this.sortDropdown);
    await dropdown.click();

    const sortMapping: Record<SortOption, string> = {
      'az': 'az',
      'za': 'za',
      'lohi': 'lohi',
      'hilo': 'hilo'
    };

    const optionLocator = By.css(`option[value="${sortMapping[sortOption]}"]`);
    await this.clickElement(optionLocator);
    await this.driver.sleep(500);
  }

  // Get current sort option
  public async getCurrentSortOption(): Promise<string> {
    const selectedValue = await this.getElementAttribute(this.sortDropdown, 'value');
    return selectedValue || 'az';
  }
  
  public async getMostExpensiveProduct(): Promise<Product> {
    const products = await this.getAllProducts();
    return products.reduce((max, product) => 
      product.price > max.price ? product : max
    );
  }

  
  public async getLeastExpensiveProduct(): Promise<Product> {
    const products = await this.getAllProducts();
    return products.reduce((min, product) => 
      product.price < min.price ? product : min
    );
  }

  // Navigate to shopping cart
  public async goToCart(): Promise<void> {
    await this.clickElement(this.shoppingCart);
  }

  // Open burger menu
  public async openMenu(): Promise<void> {
    await this.clickElement(this.burgerMenu);
    await this.driver.sleep(500);
  }

   // Check if cart badge is displayed
  public async isCartBadgeDisplayed(): Promise<boolean> {
    return await this.isElementDisplayed(this.cartBadge);
  }

   // Logout from application
  public async logout(): Promise<void> {
    await this.openMenu();
    await this.waitForElement(this.logoutLink);
    await this.clickElement(this.logoutLink);
  }


}