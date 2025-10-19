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
  // private readonly cartItemNames: By = By.css('.inventory_item_name');
  // private readonly cartItemPrices: By = By.css('.inventory_item_price');
  // private readonly cartItemDescriptions: By = By.css('.inventory_item_desc');
  // private readonly removeButtons: By = By.css('button[id^="remove"]');
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

  // Get the number of items in cart
  public async getCartItemCount(): Promise<number> {
    const items = await this.findElementsSafe(this.cartItems);
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

  public async calculateExpectedSubtotal(): Promise<number> {
    const items = await this.getCartItems();
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  public async proceedToCheckout(): Promise<void> {
    await this.clickElement(this.checkoutButton);
  }

  public async continueShopping(): Promise<void> {
    await this.clickElement(this.continueShoppingButton);
  }

  public async fillCheckoutInformation(checkoutInfo: CheckoutInfo): Promise<void> {
    await this.typeText(this.firstNameInput, checkoutInfo.firstName);
    await this.typeText(this.lastNameInput, checkoutInfo.lastName);
    await this.typeText(this.postalCodeInput, checkoutInfo.postalCode);
  }

  // Click continue button on checkout info page
  public async continueToReview(): Promise<void> {
    await this.clickElement(this.continueButton);
  }

  public async cancelCheckout(): Promise<void> {
    await this.clickElement(this.cancelButton);
  }

  /**
   * Get order summary details
   * @returns OrderSummary object
   */
  public async getOrderSummary(): Promise<OrderSummary> {
    const items = await this.getCartItems();
   
    const subtotalText = await this.getElementText(this.subtotalLabel);
    const subtotal = parseFloat(subtotalText.replace(/[^0-9.]/g, ''));
   
    const taxText = await this.getElementText(this.taxLabel);
    const tax = parseFloat(taxText.replace(/[^0-9.]/g, ''));
   
    const totalText = await this.getElementText(this.totalLabel);
    const total = parseFloat(totalText.replace(/[^0-9.]/g, ''));
    return {
      items,
      subtotal,
      tax,
      total
    };
  }

  // Get subtotal amount
  public async getSubtotal(): Promise<number> {
    const subtotalText = await this.getElementText(this.subtotalLabel);
    return parseFloat(subtotalText.replace(/[^0-9.]/g, ''));
  }

  public async getTax(): Promise<number> {
    const taxText = await this.getElementText(this.taxLabel);
    return parseFloat(taxText.replace(/[^0-9.]/g, ''));
  }

  // Get total amount
  public async getTotal(): Promise<number> {
    const totalText = await this.getElementText(this.totalLabel);
    return parseFloat(totalText.replace(/[^0-9.]/g, ''));
  }

  public async finishOrder(): Promise<void> {
    await this.clickElement(this.finishButton);
  }

  /**
   * Complete entire checkout process
   * @param checkoutInfo - Checkout information
   */
  public async completeCheckout(checkoutInfo: CheckoutInfo): Promise<void> {
    await this.proceedToCheckout();
    await this.fillCheckoutInformation(checkoutInfo);
    await this.continueToReview();
    await this.finishOrder();
  }

  // Check if order is complete
  public async isOrderComplete(): Promise<boolean> {
    try {
      return await this.isElementDisplayed(this.completeHeader);
    } catch (error) {
      return false;
    }
  }

  // Get order completion message
  public async getCompletionMessage(): Promise<string> {
    return await this.getElementText(this.completeHeader);
  }

  // Get order completion details
  public async getCompletionDetails(): Promise<string> {
    return await this.getElementText(this.completeText);
  }

  // Return to products page from completion
  public async backToProducts(): Promise<void> {
    await this.clickElement(this.backHomeButton);
  }

  //Check if the checkout button is displayed
  public async isCheckoutButtonDisplayed(): Promise<boolean> {
    return await this.isElementDisplayed(this.checkoutButton);
  }

  // Check if cart is empty
  public async isCartEmpty(): Promise<boolean> {
    const count = await this.getCartItemCount();
    return count === 0;
  }

  public async getPageTitleText(): Promise<string> {
    return await this.getElementText(this.pageTitle);
  }

  /**
   * Verify order calculations
   * @returns True if calculations are correct
   */
  public async verifyOrderCalculations(): Promise<boolean> {
    const summary = await this.getOrderSummary();
    const expectedSubtotal = summary.items.reduce((sum, item) =>
      sum + (item.price * item.quantity), 0
    );
   
    const calculatedTotal = summary.subtotal + summary.tax;
    const subtotalMatch = Math.abs(summary.subtotal - expectedSubtotal) < 0.01;
    const totalMatch = Math.abs(summary.total - calculatedTotal) < 0.01;
   
    return subtotalMatch && totalMatch;
  }
}