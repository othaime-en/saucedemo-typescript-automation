import { WebDriver, By } from 'selenium-webdriver';
import BasePage from './BasePage.js';
import type { CartItem, CheckoutInfo, OrderSummary } from '../types/index.js';

/**
 * Cart Page Object
 * Represents the shopping cart and checkout pages
 */
export default class CartPage extends BasePage {
  private readonly pageTitle: By = By.css('.title');
  private readonly cartItems: By = By.css('.cart_item');
  private readonly cartItemNames: By = By.css('.inventory_item_name');
  private readonly cartItemPrices: By = By.css('.inventory_item_price');
  private readonly cartItemDescriptions: By = By.css('.inventory_item_desc');
  private readonly removeButtons: By = By.css('button[id^="remove"]');
  private readonly checkoutButton: By = By.id('checkout');
  private readonly continueShoppingButton: By = By.id('continue-shopping');

  private readonly firstNameInput: By = By.id('first-name');
  private readonly lastNameInput: By = By.id('last-name');
  private readonly postalCodeInput: By = By.id('postal-code');
  private readonly continueButton: By = By.id('continue');
  private readonly cancelButton: By = By.id('cancel');

  private readonly subtotalLabel: By = By.css('.summary_subtotal_label');
  private readonly taxLabel: By = By.css('.summary_tax_label');
  private readonly totalLabel: By = By.css('.summary_total_label');
  private readonly finishButton: By = By.id('finish');

  private readonly completeHeader: By = By.css('.complete-header');
  private readonly completeText: By = By.css('.complete-text');
  private readonly backHomeButton: By = By.id('back-to-products');

  constructor(driver: WebDriver) {
    super(driver);
  }


  public async isOnCartPage(): Promise<boolean> {
    try {
      const url = await this.getCurrentUrl();
      return url.includes('cart.html');
    } catch (error) {
      return false;
    }
  }

  /**
   * Get all items in cart
   * @returns Array of CartItem objects
   */
  public async getCartItems(): Promise<CartItem[]> {
    const items: CartItem[] = [];
    const cartElements = await this.findElements(this.cartItems);
    for (const element of cartElements) {
      try {
        const name = await element.findElement(By.css('.inventory_item_name')).getText();
        const description = await element.findElement(By.css('.inventory_item_desc')).getText();
        const priceText = await element.findElement(By.css('.inventory_item_price')).getText();
        const price = parseFloat(priceText.replace('$', ''));
        const quantityText = await element.findElement(By.css('.cart_quantity')).getText();
        const quantity = parseInt(quantityText, 10);
        items.push({
          name,
          description,
          price,
          quantity
        });
      } catch (error) {
        continue;
      }
    }
    return items;
  }

  // Get the number of items in a cart
  public async getCartItemCount(): Promise<number> {
    const items = await this.findElements(this.cartItems);
    return items.length;
  }

  public async removeItemFromCart(productName: string): Promise<void> {
    try {
      const productId = productName.toLowerCase().replace(/\s+/g, '-');
      const removeButton = By.id(`remove-${productId}`);
      await this.clickElement(removeButton);
    } catch (error) {
      throw new Error(`Failed to remove item "${productName}": ${(error as Error).message}`);
    }
  }

  // Calculate expected subtotal from cart items
  public async calculateExpectedSubtotal(): Promise<number> {
    const items = await this.getCartItems();
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  public async continueShopping(): Promise<void> {
    await this.clickElement(this.continueShoppingButton);
  }

  //Check if cart is empty
  public async isCartEmpty(): Promise<boolean> {
    const count = await this.getCartItemCount();
    return count === 0;
  }

  public async getPageTitleText(): Promise<string> {
    return await this.getElementText(this.pageTitle);
  }
}