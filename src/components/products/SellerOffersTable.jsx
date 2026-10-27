import React from 'react';
import { ShoppingBag, ExternalLink, CheckCircle, Truck, Clock } from 'lucide-react';
import { useShopping } from '../../context/ShoppingContext.jsx';

export const SellerOffersTable = ({
  product,
  offers,
  selectedOfferId,
  onSelectOffer,
}) => {
  const { addToBasket } = useShopping();

  if (!offers || offers.length === 0) {
    return (
      <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 text-center text-sm text-slate-500">
        No active verified offers found for this product.
      </div>
    );
  }

  const lowestPrice = Math.min(...offers.map((o) => o.price));

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
      <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Available Seller Offers ({offers.length})
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Transparent pricing comparison across verified partner retailers
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50/50 text-slate-600 border-b border-slate-200 text-xs uppercase tracking-wider font-semibold">
            <tr>
              <th className="py-3 px-4">Seller & Retailer</th>
              <th className="py-3 px-4">Availability</th>
              <th className="py-3 px-4">Delivery Terms</th>
              <th className="py-3 px-4">Offer Price</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {offers.map((offer) => {
              const isLowest = offer.price === lowestPrice;
              const isSelected = selectedOfferId === offer._id;
              const discount =
                offer.originalPrice && offer.originalPrice > offer.price
                  ? Math.round(((offer.originalPrice - offer.price) / offer.originalPrice) * 100)
                  : 0;

              return (
                <tr
                  key={offer._id}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    isLowest ? 'bg-emerald-50/30' : ''
                  } ${isSelected ? 'ring-2 ring-emerald-500 ring-inset' : ''}`}
                >
                  {/* Seller info */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">
                            {offer.seller?.name || offer.sellerName || 'Verified Seller'}
                          </span>
                          {isLowest && (
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                              Lowest Price
                            </span>
                          )}
                        </div>
                        {offer.seller?.rating && (
                          <div className="text-xs text-slate-500 mt-0.5">
                            ★ {offer.seller.rating.toFixed(1)} verified rating
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Stock status */}
                  <td className="py-3.5 px-4 text-xs">
                    {offer.availability === 'in_stock' && (
                      <span className="flex items-center gap-1.5 text-emerald-700">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>In Stock</span>
                      </span>
                    )}
                    {offer.availability === 'limited' && (
                      <span className="flex items-center gap-1.5 text-amber-700">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Limited Stock</span>
                      </span>
                    )}
                    {offer.availability === 'out_of_stock' && (
                      <span className="text-slate-400">Out of Stock</span>
                    )}
                  </td>

                  {/* Delivery */}
                  <td className="py-3.5 px-4 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-slate-400" />
                      <span>{offer.seller?.deliveryDays || 'Standard 2-3 Days'}</span>
                    </div>
                  </td>

                  {/* Price column */}
                  <td className="py-3.5 px-4">
                    <div>
                      <div className="text-base font-bold text-slate-900 font-mono tabular-nums">
                        ₹{offer.price.toLocaleString('en-IN')}
                      </div>
                      {offer.originalPrice && offer.originalPrice > offer.price && (
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="text-slate-400 line-through font-mono tabular-nums">
                            ₹{offer.originalPrice.toLocaleString('en-IN')}
                          </span>
                          <span className="text-amber-600 font-semibold">{discount}% off</span>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {onSelectOffer ? (
                        <button
                          type="button"
                          onClick={() => onSelectOffer(offer)}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                            isSelected
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                          }`}
                        >
                          {isSelected ? 'Selected' : 'Select'}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => addToBasket(product, offer)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-xs"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Add to Basket</span>
                        </button>
                      )}

                      {offer.productUrl && offer.productUrl !== '#' && (
                        <a
                          href={offer.productUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Visit Seller Listing"
                          aria-label="Visit external seller link"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
