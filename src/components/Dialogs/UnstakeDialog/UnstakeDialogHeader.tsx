export const UnstakeDialogHeader = () => {
  return (
    <div className="mb-4">
      <p className="text-2xl font-bold text-left text-primary">
        Unstake from Provider
      </p>
      <p className="text-sm text-secondary mt-1">
        Unstaking begins the cooldown period for your provider. You must wait
        for this period to end before you can withdraw to your lockup contract.
      </p>
    </div>
  );
};
