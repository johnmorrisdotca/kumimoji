/**
 * Defines the `<kumimoji-table>` element on the page. Import it for its effect:
 *
 * ```html
 * <script type="module" src="https://cdn.jsdelivr.net/npm/@johnmorrisdotca/kumimoji@1/dist/element-define.js"></script>
 * <kumimoji-table language="english" hand="7"></kumimoji-table>
 * ```
 *
 * A tag already defined is left as it is, and on a server, where there is no page, nothing happens.
 */
import { KumimojiTable } from "./element.ts";

if (typeof customElements !== "undefined" && customElements.get("kumimoji-table") === undefined) customElements.define("kumimoji-table", KumimojiTable);
