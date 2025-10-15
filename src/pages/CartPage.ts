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
}